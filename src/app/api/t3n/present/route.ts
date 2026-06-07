/**
 * MediPass — T3N Selective Presentation Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/t3n/present
 * Generates a BBS+ selective VC presentation.
 * Called by the agent tool — not directly by the doctor UI.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateSelectivePresentation } from "@/lib/t3n/credentials";
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
        "emergency_contact_name",
        "emergency_contact_phone",
      ]),
    )
    .min(1),
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
