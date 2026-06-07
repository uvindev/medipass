/**
 * MediPass — T3N Patient Onboarding Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/t3n/user
 * Mints a real did:t3n for the patient (SIWE via the live SDK), issues a
 * W3C 2.0 BBS+ MedicalIdentityCredential (vc_core), and stores PatientSession
 * + a default DataToken.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createPatientIdentity, getAgentDID } from "@/lib/t3n/identity";
import { issueMedicalVC } from "@/lib/t3n/credentials";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isAppError } from "@/lib/errors";
import { ownershipHeaders } from "@/lib/watermark";

export const runtime = "nodejs";

const bodySchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.string().optional(),
  bloodType: z.string().min(1),
  allergies: z.array(z.string()),
  activeMedications: z.array(z.string()),
  emergencyContactName: z.string().min(1),
  emergencyContactPhone: z.string().min(1),
});

// Derive a stable numeric id from the did:t3n identifier (hex) for the existing
// integer-keyed PatientSession.t3nUserId column.
function numericIdFromDID(did: string): number {
  const hex = did.split(":").slice(2).join("").slice(0, 8) || "0";
  return parseInt(hex, 16) % 2_000_000_000;
}

export async function POST(request: NextRequest) {
  try {
    // 0. Require an authenticated patient — the identity binds to their account.
    const account = await getSessionUser();
    if (!account || account.role !== "patient") {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401, headers: ownershipHeaders },
      );
    }

    // One identity per account.
    const existing = await db.patientSession.findUnique({
      where: { userId: account.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "IDENTITY_EXISTS", did: existing.patientDID },
        { status: 409, headers: ownershipHeaders },
      );
    }

    const data = bodySchema.parse(await request.json());

    // 1. Mint a real did:t3n for the patient (fresh ECDSA key → SIWE auth).
    const identity = await createPatientIdentity();
    const t3nUserId = numericIdFromDID(identity.did);

    // 2. Issue the BBS+ MedicalIdentityCredential (agent is the issuer).
    const issued = await issueMedicalVC(identity.did, {
      bloodType: data.bloodType,
      allergies: data.allergies,
      activeMedications: data.activeMedications,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
    });

    const agentDID = await getAgentDID();

    // 3. Default DataToken: blood_type + allergies, 24h.
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.dataToken.create({
      data: {
        patientId: String(t3nUserId),
        patientDID: identity.did,
        agentDID,
        fields: ["blood_type", "allergies"],
        allowedHosts: [],
        expiresAt,
      },
    });

    // 4. PatientSession (holds the credential payload interim — see credentials.ts).
    await db.patientSession.create({
      data: {
        userId: account.id,
        email: account.email,
        t3nUserId,
        patientDID: identity.did,
        vcId: issued.vcId,
        vcCID: issued.cid,
        credential: issued.credential as unknown as Prisma.InputJsonValue,
      },
    });

    // Return the patient's DID + signing key (kept by the patient, never stored).
    return NextResponse.json(
      {
        did: identity.did,
        privateKeyHex: identity.privateKeyHex,
        t3nUserId,
        vcId: issued.vcId,
        vcCID: issued.cid,
      },
      { headers: ownershipHeaders },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
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
