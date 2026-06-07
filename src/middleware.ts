/**
 * MediPass — Middleware Entry
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on app routes; skip static assets, the canary, and Next internals.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|api/canary|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
