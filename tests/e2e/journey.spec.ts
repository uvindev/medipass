/**
 * MediPass — Critical-Path E2E
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Two authenticated actors against live services (Terminal 3 testnet + Supabase
 * Auth + Supabase DB + Claude):
 *   patient registers + onboards -> doctor registers + discloses -> patient
 *   revokes -> doctor is blocked.
 *
 * Patient and doctor are role-gated, so each gets its own browser context.
 */

import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/AuthPage";
import { SetupPage } from "./pages/SetupPage";
import { DoctorPage } from "./pages/DoctorPage";
import { DashboardPage } from "./pages/DashboardPage";

test("register -> onboard -> doctor discloses -> revoke blocks access", async ({
  browser,
}) => {
  const stamp = Date.now();
  const patientCtx = await browser.newContext();
  const doctorCtx = await browser.newContext();
  const patientPage = await patientCtx.newPage();
  const doctorPage = await doctorCtx.newPage();

  const setup = new SetupPage(patientPage);
  const dashboard = new DashboardPage(patientPage);
  const doctor = new DoctorPage(doctorPage);

  let did = "";

  await test.step("patient signs up and onboards a did:t3n", async () => {
    await new AuthPage(patientPage).register({
      role: "patient",
      name: "E2E Patient",
      email: `e2e.patient+${stamp}@medipass.iamuvin.com`,
      password: "test12345",
    });

    await setup.goto();
    await setup.fillProfile({
      firstName: "E2E",
      lastName: "Patient",
      bloodType: "O+",
      allergies: "Penicillin, Latex",
      medications: "Metformin 500mg",
      contactName: "Jane Doe",
      contactPhone: "+65 9123 4567",
    });
    await setup.create();
    did = await setup.getDID();
  });

  await test.step("doctor signs up and the agent discloses authorized fields", async () => {
    await new AuthPage(doctorPage).register({
      role: "doctor",
      name: "E2E Doctor",
      email: `e2e.doctor+${stamp}@medipass.iamuvin.com`,
      password: "test12345",
      hospital: "Mount Elizabeth",
    });

    await doctor.goto();
    await doctor.startRetrieval(did, "Mount Elizabeth");
    await expect(doctorPage.getByText(/access logged/i)).toBeVisible({
      timeout: 120_000,
    });

    const out = await doctor.consoleText();
    expect(out).toContain("O+");
    expect(out).toContain("Penicillin");
    expect(out).not.toContain("Metformin"); // never authorized
  });

  await test.step("patient revokes the data token", async () => {
    await dashboard.goto();
    await dashboard.revokeFirstActive();
  });

  await test.step("a revoked token blocks the agent", async () => {
    await doctor.goto(); // fresh agent session
    await doctor.startRetrieval(did, "Mount Elizabeth");
    await doctor.waitForAgentDone();

    const out = await doctor.consoleText();
    expect(out).not.toContain("Access logged");
    expect(out).not.toContain("O+");
  });

  await patientCtx.close();
  await doctorCtx.close();
});
