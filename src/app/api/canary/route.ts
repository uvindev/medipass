/**
 * MediPass — Ownership Canary Endpoint
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/canary
 * Receives unauthorized deployment pings.
 * Always returns 200 — don't alert the thief.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface CanaryBody {
  event?: string;
  origin?: string;
  path?: string;
  userAgent?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CanaryBody;

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
          from:
            process.env.RESEND_FROM_EMAIL ?? "canary@medipass.iamuvin.com",
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
