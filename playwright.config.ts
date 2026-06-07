/**
 * MediPass — Playwright E2E Configuration
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Runs against the live deployment by default. Override with E2E_BASE_URL.
 * Single worker, no retries — each run mints a real T3N user and calls Claude,
 * so we don't want to double-charge or hammer the network.
 */

import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "https://medipass-seven.vercel.app";

export default defineConfig({
  testDir: "./tests/e2e",
  // The agent runs 4 tools + an LLM on serverless cold starts — be generous.
  timeout: 150_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Default: Playwright's bundled chromium (`pnpm exec playwright install
        // chromium`). Set PW_CHANNEL=chrome to drive a system Chrome instead.
        ...(process.env.PW_CHANNEL
          ? { channel: process.env.PW_CHANNEL }
          : {}),
      },
    },
  ],
});
