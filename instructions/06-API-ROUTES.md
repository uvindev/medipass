# 06 — API Routes

> Every route handler. Typed. Validated. Ownership headers on every response.

---

## src/app/api/t3n/user/route.ts

```typescript
/**
 * MediPass — T3N User Creation Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/t3n/user
 * Creates T3N user + generates DID + stores PatientSession
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createT3NUser } from "@/lib/t3n/users";
import { registerDID } from "@/lib/t3n/did";
import { storeMedicalVC } from "@/lib/t3n/credentials";
import { generateDIDKey } from "@/lib/crypto/keys";
import { db } from "@/lib/db";
import { AppError, isAppError } from "@/lib/errors";
import { ownershipHeaders } from "@/lib/watermark";

const bodySchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.string().optional(),
  bloodType: z.string().min(1),
  allergies: z.array(z.string()),
  activeMedications: z.array(z.string()),
  emergencyContactName: z.string().min(1),
  emergencyContactPhone: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bodySchema.parse(body);

    // 1. Generate Ed25519 keypair → did:key
    const keyPair = generateDIDKey();

    // 2. Create T3N user
    const t3nUserId = await createT3NUser({
      wallet: {
        address: keyPair.walletAddress,
        chain_id: "1",
      },
      profile: {
        first_name: data.firstName,
        last_name: data.lastName,
        email_address: data.email,
        date_of_birth: data.dateOfBirth,
      },
    });

    // 3. Register DID on T3N blockchain
    await registerDID(keyPair.did, keyPair.walletAddress);

    // 4. Issue + store MedicalIdentityVC
    const storedVC = await storeMedicalVC(keyPair.did, {
      bloodType: data.bloodType,
      allergies: data.allergies,
      activeMedications: data.activeMedications,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
    });

    // 5. Create default DataToken (blood_type + allergies, 24h)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.dataToken.create({
      data: {
        patientId: String(t3nUserId),
        patientDID: keyPair.did,
        agentDID: process.env.T3N_AGENT_DID ?? "",
        fields: ["blood_type", "allergies"],
        allowedHosts: [],
        expiresAt,
      },
    });

    // 6. Store PatientSession
    await db.patientSession.create({
      data: {
        email: data.email,
        t3nUserId,
        patientDID: keyPair.did,
        vcId: storedVC.vcId,
        vcCID: storedVC.cid,
      },
    });

    // Return DID + private key for patient to store securely
    // In production: encrypt private key before sending; use hardware key storage
    return NextResponse.json(
      {
        did: keyPair.did,
        privateKeyHex: keyPair.privateKeyHex, // patient stores this
        t3nUserId,
        vcId: storedVC.vcId,
        vcCID: storedVC.cid,
      },
      { headers: ownershipHeaders },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400, headers: ownershipHeaders },
      );
    }

    if (isAppError(err)) {
      console.error(`[T3N User] ${err.code}:`, err.context);
      return NextResponse.json(
        { error: err.code },
        { status: 422, headers: ownershipHeaders },
      );
    }

    console.error("[T3N User] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ownershipHeaders },
    );
  }
}
```

---

## src/app/api/t3n/present/route.ts

```typescript
/**
 * MediPass — T3N Selective Presentation Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/t3n/present
 * Generates a BBS+ selective VC presentation.
 * Called by the agent tool — not directly by the doctor UI.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateSelectivePresentation } from "@/lib/t3n/credentials";
import { isAppError } from "@/lib/errors";
import { ownershipHeaders } from "@/lib/watermark";

const bodySchema = z.object({
  vcId: z.string().uuid(),
  fields: z.array(
    z.enum([
      "blood_type",
      "allergies",
      "active_medications",
      "emergency_contact_name",
      "emergency_contact_phone",
    ]),
  ).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const data = bodySchema.parse(await request.json());

    const presentation = await generateSelectivePresentation(
      data.vcId,
      data.fields,
    );

    return NextResponse.json(
      { data: presentation },
      { headers: ownershipHeaders },
    );
  } catch (err) {
    if (isAppError(err)) {
      return NextResponse.json(
        { error: err.code },
        { status: 422, headers: ownershipHeaders },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ownershipHeaders },
    );
  }
}
```

---

## src/app/api/token/route.ts

```typescript
/**
 * MediPass — Data Token Management Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/token      — Issue new DataToken
 * DELETE /api/token    — Revoke existing DataToken
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAppError } from "@/lib/errors";
import { ownershipHeaders } from "@/lib/watermark";

const issueSchema = z.object({
  patientId: z.string(),
  patientDID: z.string().regex(/^did:key:z/),
  fields: z.array(
    z.enum([
      "blood_type",
      "allergies",
      "active_medications",
      "emergency_contact_name",
      "emergency_contact_phone",
    ]),
  ).min(1),
  durationHours: z.number().min(1).max(168).default(24), // max 7 days
});

const revokeSchema = z.object({
  tokenId: z.string().cuid(),
  patientId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const data = issueSchema.parse(await request.json());

    const expiresAt = new Date(
      Date.now() + data.durationHours * 60 * 60 * 1000,
    );

    const token = await db.dataToken.create({
      data: {
        patientId: data.patientId,
        patientDID: data.patientDID,
        agentDID: process.env.T3N_AGENT_DID ?? "",
        fields: data.fields,
        allowedHosts: [],
        expiresAt,
      },
    });

    return NextResponse.json(
      { data: { tokenId: token.id, expiresAt: token.expiresAt } },
      { headers: ownershipHeaders },
    );
  } catch (err) {
    if (isAppError(err)) {
      return NextResponse.json(
        { error: err.code },
        { status: 422, headers: ownershipHeaders },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ownershipHeaders },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = revokeSchema.parse(await request.json());

    await db.dataToken.updateMany({
      where: { id: data.tokenId, patientId: data.patientId },
      data: { revoked: true, revokedAt: new Date() },
    });

    return NextResponse.json(
      { data: { revoked: true } },
      { headers: ownershipHeaders },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ownershipHeaders },
    );
  }
}
```

---

## src/app/api/canary/route.ts

```typescript
/**
 * MediPass — Ownership Canary Endpoint
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/canary
 * Receives unauthorized deployment pings.
 * Always returns 200 — don't alert the thief.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL ?? "canary@medipass.iamuvin.com",
          to: "uvin95dev@gmail.com",
          subject: `🚨 MediPass Canary — ${body.origin ?? "Unknown Origin"}`,
          html: `
            <pre style="font-family:monospace;background:#0a0a0a;color:#f0f0f0;padding:16px;">
Event:      ${body.event ?? "unknown"}
Origin:     ${body.origin ?? "unknown"}
Path:       ${body.path ?? "unknown"}
IP:         ${ip}
User Agent: ${body.userAgent ?? "unknown"}
Timestamp:  ${body.timestamp ?? new Date().toISOString()}
            </pre>
            <p style="color:#888;font-size:12px;">
              MediPass — Copyright (c) 2026 Uvin Vindula — uvin95dev@gmail.com
            </p>
          `,
        }),
      });
    }
  } catch {
    // Always silent — don't reveal the trap fired
  }

  // Always 200 — never alert the thief
  return NextResponse.json({ received: true });
}
```

---

## src/app/robots.ts

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/api/",
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Google-Extended"],
        disallow: "/",
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
```
