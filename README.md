# MediPass

**Cross-border medical identity agent on Terminal 3 Network.**

A patient stores their medical identity once as a `did:t3n` + BBS+ credential.
At any hospital, a Claude agent — acting **under the patient's revocable
delegation** — retrieves only the fields the clinician is authorized for, never
holds the full credential, notifies the patient, and writes an append-only
audit entry. This is Terminal 3's **Agent Auth** model (a user delegating scoped
authority to an agent) applied to the highest-stakes data there is.

Built for the **Terminal 3 Agent Dev Kit Bounty Challenge**.

- **Live:** https://medipass-seven.vercel.app
- **Repo:** https://github.com/uvindev/medipass

> Copyright (c) 2026 Uvin Vindula (IAMUVIN) — iamuvin.com — All Rights Reserved.
> Proprietary. See [LICENSE](./LICENSE), [NOTICE](./NOTICE), [SECURITY.md](./SECURITY.md).

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router), React 19, TypeScript strict (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS v4 |
| Agent | Vercel AI SDK + `@ai-sdk/anthropic`, `claude-sonnet-4-20250514`, temperature 0, 4-tool chain |
| Identity / Agent Auth | `@terminal3/t3n-sdk` (WASM + SIWE → `did:t3n`, delegation credentials), `@terminal3/vc_core` (W3C 2.0 BBS+ VCs) |
| Auth | Supabase Auth (email + password, roles in metadata) |
| Data | Prisma + Supabase PostgreSQL |
| Network | Terminal 3 Network — live **testnet** (`cn-api.sg.testnet.t3n.terminal3.io`) |
| Deploy | Vercel |

## Accounts & roles

- **Patient** — onboards a `did:t3n` + a BBS+ medical identity (13
  selectively-disclosable fields), manages authorizations, revokes access.
- **Clinician** — type (Doctor, **Medical Student**, Nurse, Paramedic,
  Pharmacist), country, specialty (type-ahead), and multiple hospitals. Drives
  the agent in the doctor portal.

Email + password via Supabase Auth; role-gated by edge middleware
(`src/middleware.ts`) — patient and clinician areas are separated.

## The agent — four tools, strict order

1. `verify_patient_did` — resolve the patient from `PatientSession`.
2. `get_medical_credential` — check the patient's authorization, then derive a
   BBS+ selective disclosure of **only** the authorized fields.
3. `format_medical_snapshot` — pure transform into a clinical summary.
4. `log_data_access` — append-only `AccessLog` + patient notification.
   Non-optional final step, enforced by the system prompt.

`temperature: 0` ⇒ deterministic tool selection.

## Agent Auth (delegation)

MediPass authorization maps onto T3N's native delegation primitives — a patient
grants the agent scoped, time-boxed, revocable authority, and the agent signs an
invocation proving it:

```bash
pnpm demo:delegation
# buildDelegationCredential (functions: disclose-blood-type, disclose-allergies)
# -> validateCredentialBody VALID -> buildInvocationPreimage -> signAgentInvocation
```

## Flow

```
Register (Supabase Auth, patient | clinician)
Patient setup  ──> POST /api/t3n/user
   fresh ECDSA key ─> SIWE handshake ─> did:t3n
   ─> vc_core BBS+ MedicalIdentityCredential ─> default DataToken ─> PatientSession (userId)

Doctor portal  ──> POST /api/agent (streamText, 4 tools)
   verify ─> disclose (BBS+, authorized fields only) ─> format ─> log + notify

Patient dashboard ──> GET /api/patient (session-keyed)
   revoke ──> DELETE /api/token ─> agent blocked on next attempt
```

## Local setup

```bash
pnpm install
cp .env.example .env.local        # fill the values below
pnpm db:push                      # create Supabase tables
pnpm dev                          # http://localhost:3000
```

Required env (see [.env.example](./.env.example)):
`T3N_DEMO_KEY` (the ADK key — an Ethereum private key for SIWE), `T3N_ENV=testnet`,
`ANTHROPIC_API_KEY`, `DATABASE_URL` + `DIRECT_URL` (Supabase),
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Optional: `RESEND_API_KEY`.

## Quality gates (all green)

```bash
pnpm typecheck     # zero errors (strict)
pnpm lint          # zero warnings
pnpm build         # production build
pnpm test          # 24 Vitest unit tests (selective-disclosure guarantee + regressions)
pnpm test:e2e      # Playwright: smoke + two-actor journey + combobox (system browser)
pnpm test:t3n      # live testnet: did:t3n auth → BBS+ credential → selective disclosure
pnpm demo:delegation  # real T3N Agent Auth delegation credential + signed invocation
```

## Status — verified live

Integrated against the **real** T3N ADK (`@terminal3/t3n-sdk` + `@terminal3/vc_core`).
The dev-kit brief's REST/`X-API-Token` API does not exist — see [BUGS.md](./BUGS.md) B1.

| Gate | State |
|------|-------|
| typecheck · lint · build | ✅ green |
| Patient + clinician auth, role gating | ✅ live |
| Patient `did:t3n` + BBS+ credential | ✅ live testnet |
| Doctor agent — selective disclosure (withholds unrequested) | ✅ live (E2E) |
| Revoke blocks the agent | ✅ live (E2E) |
| Agent Auth delegation credential | ✅ `pnpm demo:delegation` |
| 24 unit tests · E2E smoke + journey | ✅ green on production |
| TEE-side BBS+ proof derivation (issuer contract) | ⏳ seam — needs `T3N_VC_ISSUER_SCRIPT` (docs 404, BUGS.md B1a) |

## Ownership protection

Three layers: legal files (`LICENSE`/`NOTICE`/`SECURITY.md`), a DevTools console
beacon + deployment canary (`src/lib/ownership.ts` → `/api/canary`), and
`X-Built-By` / `X-Copyright` headers on every response.

See [TESTING.md](./TESTING.md) for the test strategy and [SUBMISSION.md](./SUBMISSION.md)
for the bounty write-up.

---

Built by **Uvin Vindula (IAMUVIN)** · Terra Labz · inSITE Campus · iamuvin.com
