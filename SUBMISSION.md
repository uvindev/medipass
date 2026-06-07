# MediPass — Terminal 3 Agent Dev Kit Bounty ($300 Build)

**Uvin Vindula (IAMUVIN)** · uvin95dev@gmail.com · iamuvin.com · Terra Labz

- **Live:** https://medipass-seven.vercel.app
- **GitHub:** https://github.com/uvindev/medipass
- **Demo video:** _<add Loom URL>_

---

## The agent-auth problem MediPass solves

A traveler collapses in a foreign ER. The doctor needs their **blood type and
allergies now** — but not their full medical history, and the patient can't
type a consent form. Today this is faxes, language barriers, and either
over-sharing everything or getting nothing.

**MediPass** is a cross-border medical identity agent. The patient stores their
profile **once** as a `did:t3n` + BBS+ credential. At any hospital, a Claude
agent — acting **under the patient's delegated authority** — retrieves only the
fields the doctor is authorized for, notifies the patient in real time, and
writes a cryptographic audit entry. The agent never holds the full credential.

This is the **Agent Auth SDK's core thesis** — *an AI agent acting on behalf of
a user without compromising sensitive data* — applied to the highest-stakes data
there is.

## We use Terminal 3's real Agent Auth primitives

The bounty asks for the best implementation of the **Agent Auth SDK**. MediPass
*is* the user→agent delegation model:

| T3N Agent Auth | MediPass |
|---|---|
| `did:t3n` via SIWE handshake | patient + agent identities, live on testnet |
| **delegation credential** (`buildDelegationCredential`) | patient delegates scoped, time-boxed disclosure authority to MediAgent |
| `functions` / `scopes` | `disclose-blood-type`, `disclose-allergies` only |
| signed invocation (`buildInvocationPreimage` + `signAgentInvocation`) | the agent proves it acts under the delegation |
| `revokeDelegation` | patient revokes from the dashboard → agent blocked |
| BBS+ selective disclosure (`@terminal3/vc_core`) | only authorized fields ever leave the TEE boundary |

Run the real flow:
```bash
pnpm demo:delegation   # builds + validates a real T3N delegation credential, signs an invocation
pnpm test:t3n          # did:t3n auth → BBS+ MedicalIdentityCredential → selective disclosure
```

## How it maps to the judging criteria

**How big a problem you're solving** — cross-border medical access is a
universal, life-or-death, privacy-critical problem. Selective disclosure +
patient-held delegation is the difference between "share everything" and "share
exactly what's needed, revocably."

**How stable the agent is** — `claude-sonnet-4`, `temperature: 0`, a strict
4-tool chain (`verify_patient_did → get_medical_credential →
format_medical_snapshot → log_data_access`) enforced by the system prompt.
Deterministic tool selection. Backed by **24 Vitest unit tests** (the disclosure
guarantee + regressions) and a **two-actor Playwright E2E** (register → onboard →
disclose → revoke → blocked) — all green, verified against the live deployment.

**How creative the agentic solution is** — the agent is *structurally unable* to
see unrequested fields (BBS+, mathematically enforced), authority is a real
delegation credential the patient grants and revokes, every access is logged
append-only, and the patient is notified out-of-band. Privacy by construction,
not by policy.

## What's live (real services, not mocked)

Patient + doctor **accounts** (Supabase Auth, role-gated) → patient onboards a
`did:t3n` + BBS+ credential → doctor's agent discloses only authorized fields →
patient revokes → agent blocked. Verified end-to-end on the deployed URL with
Terminal 3 testnet, Supabase, and Claude.

## Stack & verification

Next.js 15 · TypeScript strict (`exactOptionalPropertyTypes`) · Tailwind v4 ·
`@terminal3/t3n-sdk` + `@terminal3/vc_core` · Prisma/Supabase · Vercel AI SDK ·
Supabase Auth.

```bash
pnpm typecheck   # 0 errors
pnpm lint        # 0 warnings
pnpm build       # production build
pnpm test        # 24/24 unit
pnpm test:e2e    # smoke + two-actor journey (system browser)
```

## Documentation bug report ($200)

While integrating I hit reproducible doc/onboarding issues — headline: the
dev-kit instructions describe a REST API that doesn't exist; the live ADK is a
WASM SDK with SIWE auth and the "API key" is an Ethereum private key. Full,
verified report in **[BUGS.md](./BUGS.md)** (submitted separately).

---

© 2026 Uvin Vindula (IAMUVIN). All Rights Reserved. Proprietary — see LICENSE.
