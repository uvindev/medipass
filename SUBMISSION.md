# MediPass — T3N Agent Dev Kit Bounty Submission

**Author:** Uvin Vindula (IAMUVIN) · uvin95dev@gmail.com · https://iamuvin.com
**Company:** Terra Labz · terralabz.io
**Date:** 7 June 2026

- **GitHub:** _<add repo URL after push>_
- **Live demo:** _<add Vercel URL after deploy>_

---

## What MediPass is

A cross-border medical identity agent. A patient stores their medical profile
once in Terminal 3 Network's TEE-encrypted decentralized storage. When they walk
into any hospital, the doctor's Claude agent retrieves **only** the fields it is
authorized to see — blood type, allergies — using BBS+ selective disclosure. The
agent never holds the raw credential, the patient gets a real-time notification,
and the access event is written to an append-only audit log.

## The agent (claude-sonnet-4-20250514, temperature 0, maxSteps 10)

Four tools, executed in a strict order enforced by the system prompt:

1. **`verify_patient_did`** — resolves the patient's DID + T3N user id.
2. **`get_medical_credential`** — validates the patient's `DataToken`, then calls
   T3N `/v1/vc/issuer/credentials/proof` for BBS+ disclosure of only the
   authorized fields. The agent receives nothing else — enforced by the proof.
3. **`format_medical_snapshot`** — pure transform into a clinical summary.
4. **`log_data_access`** — append-only `AccessLog` write + Resend notification.
   Non-optional final step.

## How it maps to the judging criteria

- **Real T3N integration** — `did:key` generation (W3C multicodec `0xed01`),
  keccak-256 wallet derivation, user create, DID register, VC store (W3C VC
  Data Model v2, BBS+ cryptosuite), and selective presentation
  (`vcIdFields` with `urn:uuid:` keys). All wired exactly to the documented API.
- **Agent stability** — temperature 0 + an explicit ordered tool contract means
  deterministic tool selection.
- **Privacy** — selective disclosure is the core; the doctor's agent is
  structurally unable to see unrequested fields, and patient-held `DataToken`s
  gate every access and can be revoked instantly.
- **Auditability** — every disclosure is logged immutably and the patient is
  notified out-of-band.

## Engineering quality

- TypeScript strict, **`exactOptionalPropertyTypes`** + **`noUncheckedIndexedAccess`**.
- All errors are structured `AppError`s — never swallowed, never stringly-typed.
- Zero `any`.
- Ownership headers on every response; console beacon + deployment canary.

## Verification status

| Gate | Result |
|------|--------|
| `pnpm typecheck` | ✅ zero errors |
| `pnpm lint` | ✅ zero warnings/errors |
| `pnpm build` | ✅ production build, 16 routes |
| Ed25519 `did:key` generation | ✅ verified — valid `did:key:z6Mk…`, 40-hex wallet |
| Live T3N happy path | ⛔ **blocked** — the bundled staging key returns `401` on every endpoint and auth header. See **BUGS.md → B1**. A working key is needed to confirm user-create → DID-register → VC-store → presentation end-to-end. |
| Supabase / Anthropic / Resend | ⏳ wired; not run end-to-end (credentials not yet provisioned in this build) |

The code is complete and compiles/builds clean. The only thing standing between
this and a green live demo is a valid `T3N_API_KEY` (and the Supabase/Anthropic/
Resend credentials), all read from `.env.local`.

## Run it

```bash
pnpm install
cp .env.example .env.local     # fill ANTHROPIC_API_KEY, DATABASE_URL, DIRECT_URL,
                               # RESEND_API_KEY, NEXTAUTH_SECRET, and a valid T3N_API_KEY
pnpm setup:agent               # registers the agent DID, prints T3N_AGENT_* vars
pnpm db:push                   # create Supabase tables
pnpm dev                       # http://localhost:3000
pnpm test:t3n                  # live T3N staging smoke test (needs a valid key)
```

## Repository layout

- `src/lib/crypto/keys.ts` — Ed25519 + `did:key` + wallet derivation.
- `src/lib/t3n/*` — typed T3N client (`X-API-Token`), users, DID, credentials.
- `src/lib/agent/*` — the four tools + system prompt.
- `src/app/api/*` — agent stream, T3N user/present, token issue/revoke, canary,
  patient dashboard read.
- `src/app/patient/*`, `src/app/doctor/*` — patient setup/dashboard/QR + doctor portal.
- `prisma/schema.prisma` — `AccessLog`, `DataToken`, `AgentSession`, `PatientSession`.

## Documentation bug report

A separate, reproducible bug report is in **[BUGS.md](./BUGS.md)** (12 verified
issues, headed by the dead staging key). Submitted under the documentation prize.

---

© 2026 Uvin Vindula (IAMUVIN). All Rights Reserved. Proprietary — see LICENSE.
