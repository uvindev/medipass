/**
 * MediPass — AppError Tests
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { describe, it, expect } from "vitest";
import { AppError, isAppError } from "@/lib/errors";

describe("AppError", () => {
  it("carries a code and structured context", () => {
    const err = new AppError("T3N_VC_PRESENT_FAILED", { vcId: "abc" });

    expect(err.code).toBe("T3N_VC_PRESENT_FAILED");
    expect(err.context).toEqual({ vcId: "abc" });
    expect(err.name).toBe("AppError");
    expect(err).toBeInstanceOf(Error);
  });

  it("uses the code as the message when none is provided", () => {
    expect(new AppError("UNAUTHORIZED").message).toBe("UNAUTHORIZED");
  });

  it("prefers an explicit message over the code", () => {
    const err = new AppError("VALIDATION_FAILED", {}, "bad input");
    expect(err.message).toBe("bad input");
  });

  it("defaults context to an empty object", () => {
    expect(new AppError("DB_WRITE_FAILED").context).toEqual({});
  });
});

describe("isAppError", () => {
  it("is true for AppError instances", () => {
    expect(isAppError(new AppError("UNAUTHORIZED"))).toBe(true);
  });

  it("is false for plain errors and non-errors", () => {
    expect(isAppError(new Error("nope"))).toBe(false);
    expect(isAppError("string")).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});
