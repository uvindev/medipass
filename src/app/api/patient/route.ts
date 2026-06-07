/**
 * MediPass — Patient Dashboard Read Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * GET /api/patient
 * Returns the authenticated patient's identity + DataTokens + AccessLog history.
 * Keyed by the session user — no client-supplied id.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ownershipHeaders } from "@/lib/watermark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const account = await getSessionUser();
  if (!account || account.role !== "patient") {
    return NextResponse.json(
      { error: "UNAUTHORIZED" },
      { status: 401, headers: ownershipHeaders },
    );
  }

  try {
    const session = await db.patientSession.findUnique({
      where: { userId: account.id },
    });

    if (!session) {
      return NextResponse.json(
        { data: { identity: null, tokens: [], logs: [] } },
        { headers: ownershipHeaders },
      );
    }

    const patientId = String(session.t3nUserId);
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

    return NextResponse.json(
      {
        data: {
          identity: {
            did: session.patientDID,
            t3nUserId: session.t3nUserId,
            vcId: session.vcId,
          },
          tokens,
          logs,
        },
      },
      { headers: ownershipHeaders },
    );
  } catch (err) {
    console.error("[Patient Read] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: ownershipHeaders },
    );
  }
}
