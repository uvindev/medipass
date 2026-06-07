# MediPass — Submission Runbook (today)

Two emails to **devrel@terminal3.io** (send separately):
drafts in `submission/EMAIL-1-prize-300.md` and `submission/EMAIL-2-prize-200.md`.
Fill `<REPO_URL>`, `<VERCEL_URL>`, `<LOOM_URL>` first.

---

## 1. Push to GitHub (public)

`gh` is not installed here, so create the repo in the GitHub UI (or install gh),
then:

```bash
cd "/run/media/iamuvin/New Volume/UvinDev/superai"
git remote add origin https://github.com/iamuvin/medipass.git   # your repo URL
git push -u origin main
```

The commits are already authored as `Uvin Vindula <uvin95dev@gmail.com>`, dated
7 June 2026. `.env.local` is gitignored (verified) — your key will not be pushed.

## 2. Deploy to Vercel

```bash
npx vercel login          # if not logged in
npx vercel --prod
```

Set these env vars in the Vercel project (Settings → Environment Variables) —
all are in `.env.example`:

| Var | Needed for | Have it? |
|-----|-----------|----------|
| `T3N_DEMO_KEY` | T3N auth (did:t3n) | ✅ yes |
| `T3N_ENV=testnet` | network selection | ✅ |
| `ANTHROPIC_API_KEY` | the agent | ⬜ provision |
| `DATABASE_URL` + `DIRECT_URL` | Prisma/Supabase | ⬜ provision |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | patient email | ⬜ optional |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ⬜ |
| `NEXT_PUBLIC_APP_URL` | canary/links | ⬜ set to the Vercel URL |

Then create the DB tables:
```bash
pnpm db:push     # with DATABASE_URL/DIRECT_URL set
```

## 3. Blockers for a *working* live demo (be aware before recording)

- **Supabase + Anthropic are required** for the web flow. Without the DB, patient
  setup and the agent error out (they write/read Postgres). The T3N integration
  itself works without them — `pnpm test:t3n` proves auth → did:t3n → BBS+ VC →
  selective disclosure live.
- **WASM on Vercel:** the agent/setup routes load a `.wasm` via the T3N SDK
  (`serverExternalPackages` is set). If a serverless function fails to find the
  wasm, add to `next.config.mjs`:
  ```js
  outputFileTracingIncludes: { "/api/**": ["./node_modules/@terminal3/**/*.wasm"] }
  ```
  Verify the deployed `/api/t3n/user` before recording.

## 4. Demo video (3–4 min, Loom)

If Supabase/Anthropic aren't provisioned in time, record this instead — it still
proves the core:
1. `pnpm test:t3n` → show live agent + patient `did:t3n`, BBS+ credential, and
   selective disclosure withholding `active_medications`.
2. Walk the doctor portal UI + the strict 4-tool agent chain.
3. Show the patient dashboard token revocation + ownership headers/console beacon.

If fully provisioned: patient setup → doctor retrieval → patient notification →
revoke → blocked retry.

## 5. Send

- Email 1 (SUBMISSION.md, $300) → devrel@terminal3.io
- Email 2 (BUGS.md, $200) → devrel@terminal3.io (separate email)

Both reference the GitHub repo; Email 1 also needs the Vercel + Loom URLs.
