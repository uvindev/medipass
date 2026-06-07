/**
 * MediPass — T3N API Client
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Typed wrapper around the Terminal 3 staging API.
 * All requests use X-API-Token header (not Bearer).
 * All errors throw AppError — never swallowed.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { AppError } from "@/lib/errors";

const T3N_BASE_URL = process.env.T3N_BASE_URL ?? "https://staging.terminal3.io";
const T3N_API_KEY = process.env.T3N_API_KEY;

// ─── Types ───────────────────────────────────────────────────────────────────

interface T3NErrorResponse {
  errors: Array<{ code: string; message: string }>;
}

// ─── Base fetch ───────────────────────────────────────────────────────────────

/**
 * All T3N API calls go through here.
 * - Adds X-API-Token header
 * - Parses JSON response
 * - Throws AppError on non-2xx
 *
 * Why proxy through here: T3N_API_KEY must never appear in client-side code.
 * This function only runs server-side (API routes, Server Actions).
 */
export async function t3nFetch<TResponse>(
  path: string,
  options: RequestInit = {},
  subClientId?: string,
): Promise<TResponse> {
  if (!T3N_API_KEY) {
    throw new AppError("T3N_REQUEST_FAILED", {}, "T3N_API_KEY not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Token": T3N_API_KEY,
    ...(subClientId ? { "X-API-SubClient-ID": subClientId } : {}),
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };

  const response = await fetch(`${T3N_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorBody: T3NErrorResponse | null = null;
    try {
      errorBody = (await response.json()) as T3NErrorResponse;
    } catch {
      // non-JSON error body — ignore
    }

    throw new AppError("T3N_REQUEST_FAILED", {
      path,
      status: response.status,
      statusText: response.statusText,
      errors: errorBody?.errors ?? [],
    });
  }

  return response.json() as Promise<TResponse>;
}
