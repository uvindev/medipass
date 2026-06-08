/**
 * MediPass — Public Emergency Card Data
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * GET /api/e/[publicId]
 * Public, no auth. Returns only the patient-chosen emergency fields — name,
 * blood group, allergies, emergency contact. Never the DID or full record.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emergencyFromCredential } from "@/lib/emergency";
import { ownershipHeaders } from "@/lib/watermark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const session = await db.patientSession.findUnique({ where: { publicId } });
  if (!session) {
    return NextResponse.json(
      { error: "NOT_FOUND" },
      { status: 404, headers: ownershipHeaders },
    );
  }
  const info = emergencyFromCredential(session.credential, session.fullName);
  return NextResponse.json({ data: info }, { headers: ownershipHeaders });
}
