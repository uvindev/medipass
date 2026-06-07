/**
 * MediPass — T3N Selective Presentation Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/t3n/present
 * Derives a BBS+ selective-disclosure presentation for a stored credential.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { CredentialPayload } from "@terminal3/vc_core";
import { selectiveDisclose } from "@/lib/t3n/credentials";
import { db } from "@/lib/db";
import { isAppError } from "@/lib/errors";
import { ownershipHeaders } from "@/lib/watermark";

export const runtime = "nodejs";

const bodySchema = z.object({
  vcId: z.string().uuid(),
  fields: z
    .array(
      z.enum([
        "blood_type",
        "allergies",
        "active_medications",
        "chronic_conditions",
        "date_of_birth",
        "primary_language",
        "country",
        "weight",
        "height",
        "injuries",
        "special_notes",
        "emergency_contact_name",
        "emergency_contact_phone",
      ]),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  try {
    const data = bodySchema.parse(await request.json());

    const session = await db.patientSession.findFirst({
      where: { vcId: data.vcId },
    });
    if (!session?.credential) {
      return NextResponse.json(
        { error: "T3N_VC_PRESENT_FAILED" },
        { status: 404, headers: ownershipHeaders },
      );
    }

    const presentation = selectiveDisclose(
      session.credential as unknown as CredentialPayload,
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
