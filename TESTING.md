# Testing

```bash
pnpm test            # run the suite once
pnpm test:watch      # watch mode
pnpm test:coverage   # with v8 coverage
```

Vitest + React Testing Library, jsdom environment. CI runs typecheck → lint →
coverage on every push (`.github/workflows/test.yml`).

## Strategy (test pyramid)

**Unit (the bulk)** — pure logic, no network:
- `src/lib/t3n/credentials.test.ts` — **selective disclosure** is the core
  privacy guarantee: a request for specific fields returns *only* those fields
  and withholds everything else. The SDK/WASM boundary is mocked; the disclosure
  logic is exercised directly.
- `src/lib/watermark.test.ts` — regression: ownership header values must be
  ASCII (an em-dash once threw `ERR_INVALID_CHAR` and 500'd every route).
- `src/lib/errors.test.ts` — `AppError` code/context/message semantics.
- `src/types/medical.test.ts` — field registry ↔ label consistency.
- `src/lib/crypto/keys.test.ts` — hex encode/decode round-trips.

**Integration (RTL)** — component behavior from the user's view:
- `src/components/patient/AccessLog.test.tsx` — empty state, disclosed-field
  labels, hospital fallback.

**E2E (manual / live, deferred for CI)** — the full patient → agent →
disclosure → audit flow runs against real Terminal 3 testnet + Supabase +
Anthropic, verified on the deployed URL. A Playwright suite is the planned
follow-up; it is not in CI because it requires live credentials and the WASM
SDK. Until then the live deployment is the E2E surface.

## Conventions
- Behavior over implementation; tests survive refactors.
- `getByRole` / `getByLabelText` over test ids.
- Mock at boundaries (SDK, network, DB) — never internal functions.
- Deterministic: no arbitrary timeouts, no shared mutable state.

## Coverage
Coverage is scoped to the pure logic under test (`vitest.config.ts` →
`coverage.include`); `selectiveDisclose`, `errors`, `watermark`, and the medical
registry sit at 100% branch coverage. UI pages, API routes, and the
network/WASM SDK layer are covered by the live E2E surface rather than units.
Enable global thresholds in `vitest.config.ts` as component/route coverage grows.
