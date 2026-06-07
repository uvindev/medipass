/**
 * MediPass — Ownership Header Tests
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Regression: an em-dash (U+2014) in a header value threw ERR_INVALID_CHAR and
 * 500'd every route. HTTP header values must be ASCII (ISO-8859-1).
 */

import { describe, it, expect } from "vitest";
import { ownershipHeaders, robotsTxt } from "@/lib/watermark";

function isAscii(value: string): boolean {
  return [...value].every((ch) => ch.charCodeAt(0) <= 0xff);
}

describe("ownershipHeaders", () => {
  it("every header value is ASCII/latin1-safe (no em-dash regression)", () => {
    for (const [key, value] of Object.entries(ownershipHeaders)) {
      expect(isAscii(value), `${key} = "${value}"`).toBe(true);
    }
  });

  it("declares authorship and copyright", () => {
    expect(ownershipHeaders["X-Built-By"]).toContain("Uvin Vindula");
    expect(ownershipHeaders["X-Copyright"]).toContain("All Rights Reserved");
  });
});

describe("robotsTxt", () => {
  it("blocks AI scraper user-agents and the API surface", () => {
    expect(robotsTxt).toContain("Disallow: /api/");
    expect(robotsTxt).toMatch(/GPTBot/);
    expect(robotsTxt).toMatch(/ClaudeBot/);
  });
});
