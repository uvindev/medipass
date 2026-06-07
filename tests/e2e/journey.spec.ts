/**
 * MediPass — Critical-Path E2E
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * The full journey against live services (Terminal 3 testnet + Supabase +
 * Claude): patient onboarding -> doctor agent disclosure -> revoke -> blocked.
 *
 * Runs single-context so the device-local did:t3n persists between personas.
 */

import { test, expect } from "@playwright/test";
import { SetupPage } from "./pages/SetupPage";
import { DoctorPage } from "./pages/DoctorPage";
import { DashboardPage } from "./pages/DashboardPage";

test("patient setup -> doctor agent disclosure -> revoke blocks access", async ({
  page,
}) => {
  const setup = new SetupPage(page);
  const doctor = new DoctorPage(page);
  const dashboard = new DashboardPage(page);

  let did = "";

  await test.step("patient mints a did:t3n and a BBS+ credential", async () => {
    await setup.goto();
    await setup.fillProfile({
      firstName: "E2E",
      lastName: "Patient",
      email: `e2e+${Date.now()}@medipass.iamuvin.com`,
      bloodType: "O+",
      allergies: "Penicillin, Latex",
      medications: "Metformin 500mg",
      contactName: "Jane Doe",
      contactPhone: "+65 9123 4567",
    });
    await setup.create();
    did = await setup.getDID();
  });

  await test.step("doctor agent discloses only authorized fields", async () => {
    await doctor.goto();
    await doctor.startRetrieval(did, "Mount Elizabeth");
    await expect(page.getByText(/access logged/i)).toBeVisible({
      timeout: 120_000,
    });

    const out = await doctor.consoleText();
    // Disclosed: blood type + allergies.
    expect(out).toContain("O+");
    expect(out).toContain("Penicillin");
    // Withheld: medications were never authorized, so must never appear.
    expect(out).not.toContain("Metformin");
  });

  await test.step("patient revokes the data token", async () => {
    await dashboard.goto();
    await dashboard.revokeFirstActive();
  });

  await test.step("a revoked token blocks the agent's disclosure", async () => {
    await doctor.goto(); // fresh agent session
    await doctor.startRetrieval(did, "Mount Elizabeth");
    await doctor.waitForAgentDone();

    const out = await doctor.consoleText();
    // No successful disclosure: the snapshot + audit confirmation never appear.
    expect(out).not.toContain("Access logged");
    expect(out).not.toContain("O+");
  });
});
