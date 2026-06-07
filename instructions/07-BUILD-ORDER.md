# 07 — Build Order & Checklist

> Follow this sequence. Each step depends on the previous.
> Run `pnpm typecheck && pnpm lint` after every phase.

---

## Phase 0 — Foundation (before writing any component)

```
[ ] pnpm create-next-app (01-SETUP.md)
[ ] pnpm install all dependencies
[ ] Set up tsconfig.json strict mode
[ ] Create all directories
[ ] Copy .env.example → .env.local, fill all values
[ ] Install pre-commit hook
[ ] pnpm db:push (create Prisma tables)
[ ] pnpm typecheck → must pass
[ ] git commit "feat(init): MediPass scaffold"
[ ] git push → establishes legal timestamp
```

---

## Phase 1 — Crypto Layer

Files to create:
```
src/lib/errors.ts          ← AppError class
src/lib/crypto/keys.ts     ← DID key generation
src/types/t3n.ts           ← T3N request/response types
src/types/medical.ts       ← Medical domain types
```

Test:
```bash
# Quick smoke test in a script
pnpm tsx -e "
import { generateDIDKey } from './src/lib/crypto/keys.ts'
const kp = generateDIDKey()
console.log('DID:', kp.did)
console.log('Valid:', kp.did.startsWith('did:key:z6Mk'))
"
```

Expected: `Valid: true`

---

## Phase 2 — Agent DID Setup (one-time)

```bash
# Create the script
# (content in 02-CRYPTO.md → scripts/setup-agent-did.ts)

# Run it
pnpm setup:agent

# Copy output to .env.local:
# T3N_AGENT_DID=did:key:z...
# T3N_AGENT_PRIVATE_KEY=...
# T3N_AGENT_USER_ID=...
```

Verify: check the T3N staging dashboard or test the API.

---

## Phase 3 — T3N Integration

Files to create:
```
src/lib/t3n/client.ts          ← base t3nFetch wrapper
src/lib/t3n/users.ts           ← createT3NUser, getWalletAddresses
src/lib/t3n/did.ts             ← registerDID
src/lib/t3n/credentials.ts     ← storeMedicalVC, generateSelectivePresentation
src/lib/watermark.ts           ← ownershipHeaders, robotsTxt
src/lib/db.ts                  ← Prisma singleton
src/lib/db/operations.ts       ← logDataAccess, validateDataToken, revokeDataToken
```

Test each T3N function with a quick script:
```bash
pnpm tsx scripts/test-t3n.ts
# This script (write it yourself) should:
# 1. Create a test user → print user_id
# 2. Register a test DID → print success
# 3. Store a test VC → print cid
# 4. Generate a presentation → print disclosed data
```

---

## Phase 4 — Agent

Files to create:
```
src/lib/agent/tools.ts         ← all 4 tools
src/lib/agent/mediagent.ts     ← system prompt + tools map
src/app/api/agent/route.ts     ← streamText route handler
```

Test: use curl to hit the agent endpoint
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Test: did:key:z6Mktest"}]}'
```
Expected: streaming response, agent calls verify_patient_did tool.

---

## Phase 5 — Remaining API Routes

Files to create:
```
src/app/api/t3n/user/route.ts
src/app/api/t3n/present/route.ts
src/app/api/token/route.ts
src/app/api/canary/route.ts
src/app/robots.ts
```

---

## Phase 6 — Patient UI

Files to create:
```
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/patient/setup/page.tsx       ← medical profile form
src/app/patient/dashboard/page.tsx   ← access log + tokens
src/app/patient/qr/page.tsx          ← QR code generator
```

Components:
```
src/components/patient/MedicalProfileForm.tsx
src/components/patient/AccessLog.tsx
src/components/patient/TokenManager.tsx
```

---

## Phase 7 — Doctor UI

Files to create:
```
src/app/doctor/page.tsx
```

Components:
```
src/components/doctor/PatientLookup.tsx
src/components/doctor/AgentChat.tsx
src/components/doctor/MedicalSnapshot.tsx
```

---

## Phase 8 — Root Layout + Ownership

```
src/app/layout.tsx           ← meta tags + ownership beacon
src/lib/ownership.ts         ← printOwnershipBeacon, pingOwnerBeacon
src/components/shared/OwnershipFooter.tsx
```

Root layout must include:
```tsx
// In layout.tsx metadata:
export const metadata: Metadata = {
  authors: [{ name: "Uvin Vindula", url: "https://iamuvin.com" }],
  other: {
    "X-Built-By": "Uvin Vindula — IAMUVIN (iamuvin.com)",
  },
};

// In the client component wrapper:
// useEffect(() => { printOwnershipBeacon(); pingOwnerBeacon(); }, [])
```

---

## Phase 9 — Final Checks

```bash
pnpm typecheck           # zero errors
pnpm lint                # zero errors
pnpm build               # must succeed

# Manual test the full flow:
# 1. Register a patient → verify T3N user created + DID registered + VC stored
# 2. Open doctor portal → enter patient DID
# 3. Watch agent execute all 4 tools
# 4. Verify AccessLog entry in Supabase
# 5. Verify patient receives notification email
# 6. Revoke token → confirm agent fails on next attempt
```

---

## Phase 10 — Deploy + Submit

```bash
# Push to GitHub
git add .
git commit -m "feat(complete): MediPass v1.0 — T3N bounty submission"
git push

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# (all vars from .env.example)

# Test production URL
curl https://medipass.vercel.app/api/agent \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

Then:
1. Record demo video (Loom — 3-4 minutes, show full patient→doctor flow)
2. Email SUBMISSION.md to devrel@terminal3.io
3. Email BUGS.md to devrel@terminal3.io (separate email, mention $200 prize)
4. Include GitHub repo URL + Vercel demo URL in both emails

---

## What "Done" Means

Every item below must be true before submission:

```
[ ] pnpm typecheck — zero errors
[ ] pnpm lint — zero errors
[ ] pnpm build — succeeds
[ ] Patient setup flow — T3N user created, DID registered, VC stored
[ ] Doctor portal — agent executes all 4 tools successfully
[ ] AccessLog written to Supabase after every access
[ ] Patient email notification sent after access
[ ] Token revocation prevents subsequent agent access
[ ] Canary endpoint live and tested
[ ] Ownership beacon visible in browser DevTools console
[ ] Demo video recorded and working
[ ] SUBMISSION.md sent to devrel@terminal3.io
[ ] BUGS.md sent to devrel@terminal3.io
[ ] GitHub repo public with first commit timestamp on 7 June 2026
```

---

## Common Pitfalls

**T3N "Unauthorized" on all requests**
→ Check `X-API-Token` header name (not `Authorization: Bearer`)
→ Check `T3N_API_KEY` starts with `0x`

**DID registration fails with 422**
→ Verify `wallet_address` is `0x` + 40 hex chars (20 bytes)
→ Verify DID starts with `did:key:z6Mk`

**VC presentation returns empty credentials array**
→ `vcIdFields` must use `urn:uuid:<vcId>` format, not just the UUID
→ The VC must have been stored with BBS+ — check it was stored, not just drafted

**Agent loops without completing**
→ Verify `maxSteps: 10` in `streamText`
→ Check system prompt — it must explicitly instruct tool order

**`useChat` not updating on tool results**
→ Verify `maxSteps: 10` is set in `useChat` on the client side too
→ Tool results are streamed as text parts — render `m.content` as string
