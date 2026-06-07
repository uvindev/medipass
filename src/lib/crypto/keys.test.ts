/**
 * MediPass — Crypto Utility Tests
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { describe, it, expect } from "vitest";
import { bytesToHex, hexToBytes } from "@/lib/crypto/keys";

describe("hex encoding", () => {
  it("round-trips bytes through hex", () => {
    const bytes = new Uint8Array([0x00, 0x0a, 0xff, 0x10, 0xed, 0x01]);
    expect(hexToBytes(bytesToHex(bytes))).toEqual(bytes);
  });

  it("zero-pads single-digit bytes", () => {
    expect(bytesToHex(new Uint8Array([0x05]))).toBe("05");
  });

  it("accepts a 0x prefix", () => {
    expect(hexToBytes("0xed01")).toEqual(new Uint8Array([0xed, 0x01]));
  });

  it("rejects odd-length hex", () => {
    expect(() => hexToBytes("abc")).toThrow(/Invalid hex/);
  });
});
