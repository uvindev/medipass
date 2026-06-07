/**
 * MediPass — E2E Smoke
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Cheap checks that don't mint users or call the agent.
 */

import { test, expect } from "@playwright/test";

test("landing page loads with the hero", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /never held in the open/i }),
  ).toBeVisible();
});

test("ownership headers are present on every response", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-built-by"]).toContain("Uvin Vindula");
  expect(res.headers()["x-copyright"]).toContain("All Rights Reserved");
});

test("core routes respond 200", async ({ request }) => {
  for (const path of ["/", "/doctor", "/patient/setup", "/patient/dashboard"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});
