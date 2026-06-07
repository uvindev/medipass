# MediPass

**Cross-border medical identity agent on Terminal 3 Network.**

Patients store their medical profile once in T3N's TEE-encrypted decentralized
storage. A Claude agent at any hospital retrieves only the fields the doctor
requested — blood type, allergies — using BBS+ selective disclosure. The agent
never holds the raw credential. The patient gets a real-time notification. Every
access event is cryptographically logged to an append-only audit trail.

Built for the **Terminal 3 Agent Dev Kit Bounty Challenge**.

> Copyright (c) 2026 Uvin Vindula (IAMUVIN) — iamuvin.com — All Rights Reserved.
> Proprietary. See [LICENSE](./LICENSE), [NOTICE](./NOTICE), [SECURITY.md](./SECURITY.md).

---

## Stack

| Layer    | Tech |
|----------|------|
| Framework | Next.js 15 (App Router), React 19, TypeScript strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) |
| Styling   | Tailwind CSS v4 |
| Agent     | Vercel AI SDK v4 + `@ai-sdk/anthropic`, `claude-sonnet-4-20250514`, temperature 0, `maxSteps: 10` |
| Identity  | `@terminal3/t3n-sdk` (WASM + SIWE → `did:t3n`), `@terminal3/vc_core` (W3C 2.0 BBS+ VCs) |
| Data      | Prisma + Supabase PostgreSQL |
| Network   | Terminal 3 Network — live testnet (`cn-api.sg.testnet.t3n.terminal3.io`) |
| Email     | Resend |
| Deploy    | Vercel |

## The agent — four tools, strict order

1. `verify_patient_did` — resolve the patient's DID + T3N user id from `PatientSession`.
2. `get_medical_credential` — validate the `DataToken`, then call T3N `/v1/vc/issuer/credentials/proof` for BBS+ selective disclosure of only the authorized fields.
3. `format_medical_snapshot` — pure transform into a clinical summary.
4. `log_data_access` — append-only `AccessLog` write + patient email. Non-optional final step, enforced by the system prompt.

## Architecture

```
Patient setup ──> POST /api/t3n/user
   generate did:key ─> create T3N user ─> register DID
   ─> store BBS+ VC (IPFS CID) ─> issue default DataToken ─> PatientSession

Doctor portal ──> POST /api/agent (streamText)
   verify_patient_did ─> get_medical_credential (T3N TEE / BBS+)
   ─> format_medical_snapshot ─> log_data_access (+ Resend notify)

Patient dashboard ──> GET /api/patient ─> tokens + access logs
   revoke ──> DELETE /api/token ─> blocks the agent on next attempt
```

## Local setup

```bash
pnpm install
cp .env.example .env.local        # fill real values

# one-time: register the agent DID on T3N staging
pnpm setup:agent                  # paste output into .env.local

pnpm db:push                      # create Supabase tables
pnpm dev                          # http://localhost:3000
```

Quality gates (all green):

```bash
pnpm typecheck    # zero errors
pnpm lint         # zero warnings/errors
pnpm build        # production build succeeds
pnpm test:t3n     # live T3N staging smoke test (needs a valid T3N_API_KEY)
```

## Required environment

See [.env.example](./.env.example). Provisioned externally:
`ANTHROPIC_API_KEY`, `DATABASE_URL` + `DIRECT_URL` (Supabase), `RESEND_API_KEY`,
`NEXTAUTH_SECRET`, and a **valid** `T3N_API_KEY` (see status note below).

## Status

Integrated against the **real** T3N ADK (`@terminal3/t3n-sdk` + `@terminal3/vc_core`),
verified live on testnet. The brief's REST/`X-API-Token` API does not exist — see
[BUGS.md](./BUGS.md) B1.

| Gate | State |
|------|-------|
| `pnpm typecheck` | ✅ zero errors |
| `pnpm lint` | ✅ zero warnings |
| `pnpm build` | ✅ 16 routes, succeeds |
| Agent + patient `did:t3n` (SIWE) | ✅ live testnet |
| BBS+ credential + selective disclosure | ✅ verified (`pnpm test:t3n`) |
| TEE-side proof derivation (issuer contract) | ⏳ seam — needs `T3N_VC_ISSUER_SCRIPT` |
| Supabase / agent / email | ⏳ wired, not yet run end-to-end (credentials not provisioned) |

## Ownership protection

Three layers, all required: legal files (`LICENSE`/`NOTICE`/`SECURITY.md`),
a DevTools console beacon + deployment canary (`src/lib/ownership.ts` →
`/api/canary`), and `X-Built-By` / `X-Copyright` headers on every response
(`src/lib/watermark.ts` + `next.config.mjs`).

---

Built by **Uvin Vindula (IAMUVIN)** · Terra Labz · iamuvin.com
