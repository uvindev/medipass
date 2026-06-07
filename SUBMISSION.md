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

- **Real T3N integration** — live `did:t3n` minting via the SDK's WASM + SIWE
  handshake, W3C 2.0 BBS+ `MedicalIdentityCredential` via `vc_core`, and
  field-level selective disclosure. Proven against testnet, not mocked.
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

Integrated against the **real** T3N Agent Developer Kit (`@terminal3/t3n-sdk` +
`@terminal3/vc_core`), not the REST API the original brief described (which does
not exist — see BUGS.md). Verified live on **testnet**
(`https://cn-api.sg.testnet.t3n.terminal3.io`).

| Gate | Result |
|------|--------|
| `pnpm typecheck` | ✅ zero errors |
| `pnpm lint` | ✅ zero warnings/errors |
| `pnpm build` | ✅ production build, 16 routes |
| Agent SIWE auth → `did:t3n` | ✅ live testnet — `did:t3n:e8f80523…` |
| Patient identity (fresh key → `did:t3n`) | ✅ live testnet |
| BBS+ `MedicalIdentityCredential` (`vc_core`) | ✅ W3C 2.0, `bbs-2023` |
| Selective disclosure (withholds unrequested fields) | ✅ verified (`pnpm test:t3n`) |
| TEE-side VC sign+store + ZK proof derivation | ⏳ seam — `executeAndDecode` to the issuer contract; wires in once `T3N_VC_ISSUER_SCRIPT` is known |
| Supabase / Anthropic / Resend | ⏳ wired; not run e2e (credentials not provisioned) |

`pnpm test:t3n` runs the full live flow: agent auth → patient `did:t3n` → BBS+
credential → selective disclosure of `blood_type` + `allergies` only (confirms
`active_medications` is withheld). The remaining work is the TEE issuer-contract
call for the cryptographic proof; the data-layer disclosure guarantee already
holds.

## Run it

```bash
pnpm install
cp .env.example .env.local     # T3N_DEMO_KEY is the ADK key; also fill
                               # ANTHROPIC_API_KEY, DATABASE_URL, DIRECT_URL,
                               # RESEND_API_KEY, NEXTAUTH_SECRET
pnpm test:t3n                  # live testnet e2e: auth → did:t3n → BBS+ VC → disclosure
pnpm setup:agent               # prints the agent did:t3n for T3N_AGENT_DID
pnpm db:push                   # create Supabase tables
pnpm dev                       # http://localhost:3000
```

## Repository layout

- `src/lib/t3n/sdk.ts` — WASM-cached SDK wrapper; SIWE auth → `did:t3n`.
- `src/lib/t3n/identity.ts` — patient + agent `did:t3n` minting.
- `src/lib/t3n/credentials.ts` — `vc_core` BBS+ credential + selective disclosure.
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
