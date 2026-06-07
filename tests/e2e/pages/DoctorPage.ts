/**
 * MediPass — Doctor Portal Page Object
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { type Page, type Locator, expect } from "@playwright/test";

export class DoctorPage {
  readonly page: Page;
  readonly didInput: Locator;
  readonly hospitalInput: Locator;
  readonly retrieve: Locator;
  readonly console: Locator;

  constructor(page: Page) {
    this.page = page;
    this.didInput = page.getByPlaceholder(/did:t3n/i);
    this.hospitalInput = page.getByPlaceholder(/hospital/i);
    this.retrieve = page.getByRole("button", { name: /retrieve patient data/i });
    // Streaming console panel (no semantic role — stable test id).
    this.console = page.getByTestId("agent-console");
  }

  async goto() {
    await this.page.goto("/doctor");
    await this.retrieve.waitFor();
  }

  /** Kicks off the agent. Does NOT wait for completion. */
  async startRetrieval(did: string, hospital?: string) {
    await this.didInput.fill(did);
    if (hospital) await this.hospitalInput.fill(hospital);
    await this.retrieve.click();
  }

  /** Waits for the agent to finish (button re-enabled after the stream ends). */
  async waitForAgentDone() {
    await expect(this.retrieve).toBeEnabled({ timeout: 120_000 });
  }

  async consoleText(): Promise<string> {
    return (await this.console.innerText()).trim();
  }
}
