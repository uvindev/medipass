To: devrel@terminal3.io
Subject: MediPass — T3N Agent Dev Kit Bounty — Uvin Vindula — IAMUVIN

Hi Terminal 3 team,

Submitting MediPass for the Agent Dev Kit Bounty Challenge (best implementation).

MediPass is a cross-border medical identity agent on Terminal 3. A patient mints
a did:t3n and stores a BBS+ MedicalIdentityCredential once. At any hospital, a
Claude agent (claude-sonnet-4, temperature 0, strict 4-tool chain) retrieves only
the fields the doctor is authorized for via selective disclosure, notifies the
patient, and writes an append-only audit log. The agent never holds the full
credential.

It integrates the real ADK — @terminal3/t3n-sdk (WASM + SIWE) and
@terminal3/vc_core — verified live on testnet:
  - agent + per-patient did:t3n via SIWE handshake
  - W3C 2.0 BBS+ MedicalIdentityCredential (vc_core)
  - selective disclosure that withholds unrequested fields
(`pnpm test:t3n` runs this full flow end-to-end.)

  GitHub:      <REPO_URL>
  Live demo:   <VERCEL_URL>
  Demo video:  <LOOM_URL>

Full write-up is in SUBMISSION.md in the repo. One honest note: the dev-kit brief
I worked from described a REST API (staging.terminal3.io, X-API-Token, did:key)
that doesn't match the live ADK; details and the working integration are in the
repo. A separate documentation bug report follows in another email.

Stack: Next.js 15, TypeScript (strict), Prisma/Supabase, Vercel AI SDK,
@terminal3/t3n-sdk + vc_core.

Thanks,
Uvin Vindula (IAMUVIN)
uvin95dev@gmail.com · https://iamuvin.com · Terra Labz
