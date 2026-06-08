/**
 * MediPass — Resolve a scanned publicId to a DID (clinician-only)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * GET /api/resolve?publicId=...
 * A logged-in clinician scans a patient's QR; this maps the public id to the
 * patient's did:t3n so the agent can run an authorized retrieval.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ownershipHeaders } from "@/lib/watermark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const account = await getSessionUser();
  if (!account || account.role !== "doctor") {
    return NextResponse.json(
      { error: "UNAUTHORIZED" },
      { status: 401, headers: ownershipHeaders },
    );
  }

  const publicId = request.nextUrl.searchParams.get("publicId");
  if (!publicId) {
    return NextResponse.json(
      { error: "publicId required" },
      { status: 400, headers: ownershipHeaders },
    );
  }

  const session = await db.patientSession.findUnique({
    where: { publicId },
    select: { patientDID: true, fullName: true },
  });
  if (!session) {
    return NextResponse.json(
      { error: "NOT_FOUND" },
      { status: 404, headers: ownershipHeaders },
    );
  }

  return NextResponse.json(
    { data: { did: session.patientDID, fullName: session.fullName } },
    { headers: ownershipHeaders },
  );
}
