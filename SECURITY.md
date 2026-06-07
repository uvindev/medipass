# Security & Ownership Enforcement

MediPass is proprietary software. Copyright (c) 2026 Uvin Vindula (IAMUVIN).
See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

## Reporting a Vulnerability

Report security issues privately to **uvin95dev@gmail.com**. Do not open public
issues for security matters. Expect an acknowledgement within 72 hours.

Include:
- A description of the vulnerability and its impact
- Steps to reproduce
- Affected route, file, or component

## Ownership-Protection Layers

MediPass embeds three layers of authorship enforcement. Removing or disabling
any of them is a violation of the LICENSE.

1. **Legal** — `LICENSE`, `NOTICE`, and this `SECURITY.md` at the repository
   root establish authorship and first-publication date (7 June 2026).

2. **Console beacon** — every page prints an authorship banner to the browser
   DevTools console via `printOwnershipBeacon()`.

3. **HTTP headers** — every response carries `X-Built-By` and `X-Copyright`
   headers (`src/lib/watermark.ts` + `next.config.mjs`).

## Deployment Canary

`pingOwnerBeacon()` runs on first paint. When the app is served from an origin
not on the allow-list, it POSTs telemetry (origin, path, user agent, timestamp,
IP) to `/api/canary`, which emails the copyright holder. The endpoint always
returns `200` so an unauthorized operator receives no signal that the trap
fired. This telemetry is retained as evidence of infringement.

## Handling of Sensitive Data

- The T3N API key is server-only; it never reaches the client (`t3nFetch`).
- Patient medical credentials are stored encrypted in T3N's TEE-backed storage;
  MediPass never persists raw credential values.
- The agent receives only BBS+ selectively-disclosed fields — never the full VC.
- All data-access events are written to an append-only `AccessLog`.
