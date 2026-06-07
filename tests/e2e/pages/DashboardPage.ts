/**
 * MediPass — Patient Dashboard Page Object
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { type Page, type Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly revokeButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.revokeButtons = page.getByRole("button", { name: /^revoke$/i });
  }

  async goto() {
    await this.page.goto("/patient/dashboard");
    await this.page.getByRole("heading", { name: /access control/i }).waitFor();
  }

  /** Revokes the first active token and waits for the "Revoked" badge. */
  async revokeFirstActive() {
    await expect(this.revokeButtons.first()).toBeVisible({ timeout: 30_000 });
    await this.revokeButtons.first().click();
    await expect(this.page.getByText(/^Revoked$/i).first()).toBeVisible({
      timeout: 30_000,
    });
  }
}
