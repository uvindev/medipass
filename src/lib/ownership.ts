/**
 * MediPass — Ownership Beacon
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Layer 2 of the ownership-protection scheme:
 *   - printOwnershipBeacon() — prints an authorship banner in DevTools
 *   - pingOwnerBeacon()      — fires the canary if served from an unknown origin
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

// Origins that are authorized to serve this app. Anything else trips the canary.
const ALLOWED_HOST_FRAGMENTS = [
  "localhost",
  "127.0.0.1",
  "medipass.vercel.app",
  "medipass.iamuvin.com",
  "iamuvin.com",
];

/**
 * Prints an authorship banner to the browser console (Bitcoin-orange).
 * Visible to anyone who opens DevTools — a passive ownership marker.
 */
export function printOwnershipBeacon(): void {
  if (typeof window === "undefined") return;

  // eslint-disable-next-line no-console
  console.log(
    "%c IAMUVIN ",
    "background:#F7931A;color:#0A0A0A;font-weight:bold;padding:4px 8px;",
    "\nMediPass — Built by Uvin Vindula — iamuvin.com" +
      "\nCopyright (c) 2026 Uvin Vindula. All Rights Reserved." +
      "\nProprietary software. Unauthorized use is a copyright violation.",
  );
}

/**
 * If the app is served from an origin not on the allow-list, POST a beacon
 * to /api/canary. The endpoint always returns 200 — the visitor never knows.
 */
export function pingOwnerBeacon(): void {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  const isAuthorized = ALLOWED_HOST_FRAGMENTS.some((fragment) =>
    host.includes(fragment),
  );
  if (isAuthorized) return;

  const payload = {
    event: "unauthorized_deployment",
    origin: window.location.origin,
    path: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  // keepalive lets the request survive a page unload.
  void fetch("/api/canary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Silent by design — never reveal the trap.
  });
}
