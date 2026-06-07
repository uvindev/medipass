/**
 * MediPass — Auth Page Object
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { type Page } from "@playwright/test";

type Role = "patient" | "doctor";

export interface Account {
  role: Role;
  name: string;
  email: string;
  password: string;
  hospital?: string;
}

export class AuthPage {
  constructor(readonly page: Page) {}

  /** Registers a new account and waits for the post-signup redirect home. */
  async register(acc: Account) {
    await this.page.goto("/register");
    await this.page
      .getByRole("button", { name: new RegExp(`^${acc.role}$`, "i") })
      .click();
    await this.page.getByLabel("Full name").fill(acc.name);
    await this.page.getByLabel("Email").fill(acc.email);
    await this.page.getByLabel("Password").fill(acc.password);
    if (acc.role === "doctor" && acc.hospital) {
      await this.page.getByLabel(/hospital/i).fill(acc.hospital);
    }
    await this.page
      .getByRole("button", { name: /create (patient|doctor) account/i })
      .click();
    await this.page.waitForURL(
      acc.role === "doctor" ? "**/doctor" : "**/patient/dashboard",
      { timeout: 30_000 },
    );
  }

  async login(email: string, password: string, expectPath: string) {
    await this.page.goto("/login");
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: /^sign in$/i }).click();
    await this.page.waitForURL(`**${expectPath}`, { timeout: 30_000 });
  }
}
