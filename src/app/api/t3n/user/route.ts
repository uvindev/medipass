/**
 * MediPass — T3N User Creation Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/t3n/user
 * Creates T3N user + generates DID + stores PatientSession
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createT3NUser } from "@/lib/t3n/users";
import { registerDID } from "@/lib/t3n/did";
import { storeMedicalVC } from "@/lib/t3n/credentials";
import { generateDIDKey } from "@/lib/crypto/keys";
import { db } from "@/lib/db";
import { isAppError } from "@/lib/errors";
import { ownershipHeaders } from "@/lib/watermark";
import type { T3NCreateUserRequest } from "@/types/t3n";

export const runtime = "nodejs";

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

    // 2. Create T3N user.
    // date_of_birth is only spread in when present — exactOptionalPropertyTypes
    // forbids assigning `undefined` to the optional profile field.
    const profile: T3NCreateUserRequest["profile"] = {
      first_name: data.firstName,
      last_name: data.lastName,
      email_address: data.email,
      ...(data.dateOfBirth ? { date_of_birth: data.dateOfBirth } : {}),
    };

    const t3nUserId = await createT3NUser({
      wallet: {
        address: keyPair.walletAddress,
        chain_id: "1",
      },
      profile,
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

    // Return DID + private key for patient to store securely.
    // In production: encrypt private key before sending; use hardware key storage.
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
