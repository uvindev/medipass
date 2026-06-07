/**
 * MediPass — SDK Health Diagnostic (temporary)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * GET /api/health/sdk
 * Imports the T3N SDK + loads its WASM INSIDE a try/catch so the real error is
 * returned as JSON. Route-level module-load failures otherwise surface as a
 * generic 500 with no detail. Remove once the serverless WASM path is verified.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const steps: Record<string, string> = {};
  try {
    steps.node = process.version;
    steps.import_sdk = "start";
    const sdk = await import("@terminal3/t3n-sdk");
    steps.import_sdk = "ok";

    steps.import_vc = "start";
    await import("@terminal3/vc_core");
    steps.import_vc = "ok";

    steps.load_wasm = "start";
    const wasm = await sdk.loadWasmComponent();
    steps.load_wasm = wasm ? "ok" : "returned-null";

    return NextResponse.json({ ok: true, steps });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json(
      {
        ok: false,
        steps,
        error: String(e?.message ?? e),
        name: e?.name,
        code: (e as { code?: string })?.code,
        stack: e?.stack?.split("\n").slice(0, 12),
      },
      { status: 200 },
    );
  }
}
