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

test("public routes respond 200", async ({ request }) => {
  for (const path of ["/", "/login", "/register"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test("protected routes redirect anonymous users to login", async ({
  request,
}) => {
  for (const path of ["/patient/dashboard", "/doctor", "/patient/setup"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect([302, 307], path).toContain(res.status());
    expect(res.headers()["location"], path).toContain("/login");
  }
});

test("clinician specialty autocomplete suggests while typing", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "Clinician" }).click();

  const specialty = page.getByPlaceholder(/type to search/i);
  await specialty.click();
  await specialty.fill("den");

  // The suggestion list filters to Dentistry; selecting it fills the field.
  await page.getByRole("option", { name: /dentistry/i }).click();
  await expect(specialty).toHaveValue("Dentistry");
});
