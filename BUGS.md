# Terminal 3 — Documentation & Dev-Kit Bug Report

Author: Uvin Vindula (IAMUVIN) — uvin95dev@gmail.com — iamuvin.com
Project: MediPass — T3N Agent Dev Kit Bounty Challenge
Date: 7 June 2026

These are concrete, reproducible issues found while building a full agent
integration against Terminal 3 Network staging and the dev-kit materials.
Each is something that cost real integration time. Reproductions are included
where possible. I have only listed issues I could actually verify — I have not
padded the count.

---

## BLOCKER

### B1. Staging API key returns `401 unauthorized` on every endpoint and header scheme
The provided staging key
`0x66160ba24c43fc85fdad5f787b40385730f79de2e1713f4ba81d4bdeb08bc438`
does not authenticate. The host is reachable (`GET /` → `200`) and
`/v1/user/create` exists (`GET` it → `404 Cannot GET`, i.e. POST-only), but
every authenticated call fails.

Reproduction:
```bash
KEY=0x66160ba24c43fc85fdad5f787b40385730f79de2e1713f4ba81d4bdeb08bc438
B=https://staging.terminal3.io
D='{"profile":{"first_name":"A","last_name":"B","email_address":"t@example.com"}}'

curl -s -w " [%{http_code}]\n" -XPOST $B/v1/user/create -H 'Content-Type: application/json' -H "X-API-Token: $KEY"        -d "$D"
curl -s -w " [%{http_code}]\n" -XPOST $B/v1/user/create -H 'Content-Type: application/json' -H "Authorization: Bearer $KEY" -d "$D"
curl -s -w " [%{http_code}]\n" -XPOST $B/v1/user/create -H 'Content-Type: application/json' -H "x-api-key: $KEY"           -d "$D"
# all → {"errors":[{"code":"unauthorized","message":"Unauthorized request."}]} [401]
```
Also tried the key without the `0x` prefix — still `401`.

Impact: no participant can complete the live flow (user create → DID register →
VC store → selective disclosure) with this key. **A working staging key is
required to verify any T3N call.** This is the single highest-impact issue.

---

## DOCUMENTATION ACCURACY

### B2. Dev-kit code is Vercel AI SDK v4 but documented as "v5"
The agent docs state "Vercel AI SDK v5" yet every snippet uses v4-only APIs:
- `streamText({ maxSteps: 10 })` — v5 removed `maxSteps` in favour of `stopWhen: stepCountIs(10)`.
- `result.toDataStreamResponse()` — v5 renames this to `toUIMessageStreamResponse()`.
- `tool({ parameters: z.object(...) })` — v5 renames `parameters` → `inputSchema`.
- `useChat({ api, maxSteps, append, isLoading })` from `@ai-sdk/react` — v5 drops
  `append`/`isLoading` and the `api` option (replaced by a transport + `sendMessage`).

Installing `ai@5` against the documented code does not compile. The code only
works on `ai@4` + `@ai-sdk/anthropic@1` + `@ai-sdk/react@1`. Either pin v4 in the
docs or migrate the snippets to v5.

### B3. `@noble/curves` "v1.x" claim breaks on current npm
02-CRYPTO says "verified against @noble/curves v1.x", but `pnpm add @noble/curves`
now resolves **v2.x**, which renamed `ed25519.utils.randomPrivateKey()` and
changed module exports. The unpinned install breaks `keys.ts`. Pin
`@noble/curves@^1` / `@noble/hashes@^1` (verified working: `1.9.7` / `1.8.0`).

### B4. Mandated `tsconfig` (`exactOptionalPropertyTypes`) rejects the "production-ready" code
The setup doc mandates `exactOptionalPropertyTypes: true`, but several provided
snippets assign `string | undefined` to optional properties, which that flag
forbids. Concrete failures:
- 06-API-ROUTES `t3n/user`: `profile: { …, date_of_birth: data.dateOfBirth }`
  where `dateOfBirth?: string`.
- 05-AGENT `MedicalSnapshot`: `bloodType: disclosedData["blood_type"] as string | undefined`
  into `bloodType?: string`.
- 05-AGENT `logDataAccess` / `notifyPatient`: forwarding `hospitalName` (possibly
  `undefined`) into `hospitalName?: string`.

`tsc --noEmit` fails until each optional is widened to `?: T | undefined` or the
value is conditionally spread. The "copy verbatim" instruction and the tsconfig
flag contradict each other.

### B5. Brief references docs that don't exist
The root brief says to read `instructions/CLAUDE.md` and
`instructions/ARCHITECTURE.md` "first", but the package only ships `01`–`07`.
Both referenced files are absent.

### B6. 04-DATABASE says "Three models" but defines four
The header comment reads "Three models: AccessLog, DataToken, AgentSession",
while the schema (and the file map) define **four** — `PatientSession` is the
load-bearing one the agent's `verify_patient_did` actually queries.

### B7. `AgentSession` model is defined but never used
`AgentSession` (with a `messages Json` history) is in the schema and described
as holding Claude message history, but no provided code reads or writes it — the
agent route is stateless and `useChat` keeps history client-side. Either wire it
or drop it.

### B8. No read endpoints for the patient dashboard
The dashboard is specified (access log + token management), but the provided API
surface has no GET: `/api/token` is POST/DELETE only and there is no access-log
read route. The dashboard cannot render without an added endpoint (I added
`GET /api/patient`).

---

## CORRECTNESS / SECURITY

### B9. `format_medical_snapshot` hardcodes `proofValid: true`
The snapshot tool sets `proofValid: true` unconditionally and never verifies the
BBS+ proof returned by `/v1/vc/issuer/credentials/proof`. In a clinical/identity
context the UI then displays "BBS+ verified" for an unverified proof. The docs
should either verify the derived proof or stop asserting validity.

### B10. `zod` `ZodError.errors` is deprecated
06-API-ROUTES reads `err.errors` on a `ZodError`; on `zod@3.25+` this is
deprecated in favour of `err.issues` (and removed in zod 4). Minor, but emits
deprecation noise.

### B11. `next lint` is deprecated in Next 15.5
The `lint` script relies on `next lint`, which prints a deprecation notice in
15.5 and is removed in Next 16. Recommend documenting the ESLint CLI path.

### B12. `did:key` length figure is off
02-CRYPTO says an Ed25519 `did:key` is "~55–58 characters after `did:key:`".
Actual length is 48 base58 characters (e.g. `z6Mk…`, observed consistently).
The `z6Mk` prefix guidance is correct; the length figure is not.

---

## SUMMARY

| # | Severity | Area |
|---|----------|------|
| B1 | Blocker | Auth — dead staging key |
| B2 | High | AI SDK version mismatch |
| B3 | High | noble-curves version drift |
| B4 | High | tsconfig vs sample code |
| B5 | Medium | Missing referenced docs |
| B6 | Low | Schema comment inaccuracy |
| B7 | Medium | Unused `AgentSession` model |
| B8 | Medium | Missing dashboard read API |
| B9 | High | Unverified proof shown as verified |
| B10 | Low | Deprecated zod API |
| B11 | Low | Deprecated `next lint` |
| B12 | Low | `did:key` length figure |

The blocker (B1) prevents any live verification of the T3N happy path. Please
issue a working staging key so the rest can be confirmed end-to-end.
