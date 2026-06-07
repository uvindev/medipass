/**
 * MediPass — Data Token Management Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/token      — Issue new DataToken
 * DELETE /api/token    — Revoke existing DataToken
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAppError } from "@/lib/errors";
import { ownershipHeaders } from "@/lib/watermark";

export const runtime = "nodejs";

const issueSchema = z.object({
  patientId: z.string(),
  patientDID: z.string().regex(/^did:key:z/),
  fields: z
    .array(
      z.enum([
        "blood_type",
        "allergies",
        "active_medications",
        "emergency_contact_name",
        "emergency_contact_phone",
      ]),
    )
    .min(1),
  durationHours: z.number().min(1).max(168).default(24), // max 7 days
});

const revokeSchema = z.object({
  tokenId: z.string().cuid(),
  patientId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const data = issueSchema.parse(await request.json());

    const expiresAt = new Date(Date.now() + data.durationHours * 60 * 60 * 1000);

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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ownershipHeaders },
    );
  }
}
