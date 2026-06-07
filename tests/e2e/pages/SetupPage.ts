/**
 * MediPass — Patient Setup Page Object
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { type Page, type Locator, expect } from "@playwright/test";

export interface ProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  bloodType: string;
  allergies: string;
  medications: string;
  contactName: string;
  contactPhone: string;
}

export class SetupPage {
  readonly page: Page;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submit = page.getByRole("button", { name: /create medical identity/i });
  }

  async goto() {
    await this.page.goto("/patient/setup");
    await this.submit.waitFor();
  }

  async fillProfile(p: ProfileInput) {
    await this.page.getByLabel("First name").fill(p.firstName);
    await this.page.getByLabel("Last name").fill(p.lastName);
    await this.page.getByLabel("Email").fill(p.email);
    await this.page.getByLabel("Blood type").selectOption(p.bloodType);
    await this.page.getByLabel(/allergies/i).fill(p.allergies);
    await this.page.getByLabel(/active medications/i).fill(p.medications);
    await this.page.getByLabel("Emergency contact name").fill(p.contactName);
    await this.page.getByLabel("Emergency contact phone").fill(p.contactPhone);
  }

  /** Submits and waits for the on-chain identity to be minted (real T3N + DB). */
  async create(): Promise<void> {
    await this.submit.click();
    await expect(
      this.page.getByText(/identity created on terminal 3/i),
    ).toBeVisible({ timeout: 90_000 });
  }

  /** The did:t3n the app persisted for this device. */
  async getDID(): Promise<string> {
    const raw = await this.page.evaluate(() =>
      window.localStorage.getItem("medipass.identity"),
    );
    expect(raw, "identity should be in localStorage after setup").toBeTruthy();
    const did = JSON.parse(raw as string).did as string;
    expect(did).toMatch(/^did:t3n:/);
    return did;
  }
}
