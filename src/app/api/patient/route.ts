/**
 * MediPass — Patient Dashboard Read Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * GET /api/patient?patientId=<t3nUserId>
 * Returns the patient's DataTokens + AccessLog history for the dashboard.
 *
 * NOTE: read access is keyed by patientId only in this sandbox build.
 * Production must gate this behind authenticated session ownership.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ownershipHeaders } from "@/lib/watermark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const patientId = request.nextUrl.searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json(
      { error: "patientId is required" },
      { status: 400, headers: ownershipHeaders },
    );
  }

  try {
    const [tokens, logs] = await Promise.all([
      db.dataToken.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" },
      }),
      db.accessLog.findMany({
        where: { patientId },
        orderBy: { timestamp: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({ data: { tokens, logs } }, { headers: ownershipHeaders });
  } catch (err) {
    console.error("[Patient Read] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ownershipHeaders },
    );
  }
}
