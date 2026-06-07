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

**E2E (Playwright, against the live URL)** — `tests/e2e/`:
- `journey.spec.ts` — the full critical path: patient setup → doctor agent
  discloses only `blood_type` + `allergies` (asserts medications are withheld)
  → patient revokes the token → a fresh agent run is blocked.
- `smoke.spec.ts` — landing loads, ownership headers present, core routes 200.

```bash
pnpm exec playwright install chromium   # once
pnpm test:e2e                           # runs against medipass-seven.vercel.app
E2E_BASE_URL=http://localhost:3000 pnpm test:e2e   # or a local server
pnpm test:e2e:report                    # open the HTML report
```

Page Object Model in `tests/e2e/pages/`. Single worker, no retries — each run
mints a real T3N user and calls Claude, so it costs a few cents and shouldn't be
parallelized or auto-retried. **Not in CI** for the same reason (live creds +
cost + the WASM SDK). The deployed URL is the E2E target.

> Note: Playwright's browser binaries don't support every host OS; if
> `playwright install` reports an unsupported platform, run the E2E from a
> standard Linux/macOS/Windows machine. The underlying flow is independently
> verified live.

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
