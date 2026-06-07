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

## HEADLINE FINDING

### B1. The documented REST API does not exist — the live ADK is a WASM SDK with SIWE auth
The dev-kit instructions describe a REST API: base `https://staging.terminal3.io`,
`X-API-Token` header, `did:key` only, endpoints `/v1/user/create`,
`/v1/did/register`, `/v1/vc/issuer/store`, `/v1/vc/issuer/credentials/proof`.

None of that matches the live Agent Developer Kit. Every authenticated REST call
returns `401`:
```bash
KEY=0x66160ba24c43fc85fdad5f787b40385730f79de2e1713f4ba81d4bdeb08bc438
B=https://staging.terminal3.io
D='{"profile":{"first_name":"A","last_name":"B","email_address":"t@example.com"}}'
curl -s -w " [%{http_code}]\n" -XPOST $B/v1/user/create -H 'Content-Type: application/json' -H "X-API-Token: $KEY"        -d "$D"   # 401
curl -s -w " [%{http_code}]\n" -XPOST $B/v1/user/create -H 'Content-Type: application/json' -H "Authorization: Bearer $KEY" -d "$D"  # 401
```
The 401 is not a dead key — it's the wrong protocol. The key is **valid**; it is
an **Ethereum private key** used for SIWE auth inside the SDK's WASM, not a
bearer token. The real flow (verified live on testnet):
```ts
import { T3nClient, loadWasmComponent, createEthAuthInput, eth_get_address, metamask_sign, setEnvironment } from "@terminal3/t3n-sdk";
setEnvironment("testnet");                            // node: cn-api.sg.testnet.t3n.terminal3.io
const addr = eth_get_address(process.env.T3N_DEMO_KEY!);
const c = new T3nClient({ wasmComponent: await loadWasmComponent(),
  handlers: { EthSign: metamask_sign(addr, undefined, process.env.T3N_DEMO_KEY!) } });
await c.handshake();
const did = await c.authenticate(createEthAuthInput(addr)); // did:t3n:e8f80523…
```
Corrections to the documented "verified facts":
- base URL: resolved by `setEnvironment("testnet")`, not `staging.terminal3.io`
- auth: SIWE via `@terminal3/t3n-sdk`, no `X-API-Token`
- DID method: **`did:t3n:`**, not `did:key:`
- VCs: `@terminal3/vc_core` (`prepareCredentialPayload`, BBS+), not `/v1/vc/...`
- user onboarding: `otpRequest` → `otpVerify` → `submitUserInput`, not `/v1/user/create`

Impact: anyone following the brief's API spec gets 401 on every call and cannot
progress. MediPass was re-pointed at the real SDK and the full flow now runs live.

### B1a. The hosted VC SDK docs (issuer/verifier) are missing from the index
`docs.terminal3.io/llms.txt` lists ADK contract pages and `intro/components/vc.md`
but omits the `api-reference/vc-sdk/*` pages that search surfaces, and the obvious
`.md` paths for `issuer-sdk/issue-credential` / `verifier-sdk/verify-presentation`
return `404`. `intro/components/vc.md` itself states the "specific SDK package
names, function names, and contract addresses are not detailed." There is no
copy-pasteable example of issuing a VC and deriving a selective-disclosure
presentation — the single most important flow for an identity agent.

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
| B1 | Blocker | Documented REST API doesn't exist (live ADK is WASM SDK + SIWE) |
| B1a | High | Hosted VC SDK (issuer/verifier) docs missing/404, no issue+disclose example |
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

B1 cost the most time: the documented API is a different (non-existent) protocol
from the live ADK. Once re-pointed at `@terminal3/t3n-sdk` + `@terminal3/vc_core`,
the full flow runs live on testnet (auth → `did:t3n` → BBS+ credential →
selective disclosure). The one remaining gap is B1a — the issuer/verifier VC SDK
docs needed to wire the TEE-side proof derivation.
