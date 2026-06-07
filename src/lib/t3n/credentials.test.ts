/**
 * MediPass — Selective Disclosure Tests
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * The core privacy guarantee: a disclosure for specific fields returns ONLY
 * those fields. Everything else must stay hidden. These tests are the contract.
 */

import { describe, it, expect, vi } from "vitest";

// Isolate the pure selectiveDisclose() from the network/WASM SDK layer that the
// rest of credentials.ts depends on (mock at the boundary, not the logic).
vi.mock("@terminal3/vc_core", () => ({
  prepareCredentialPayload: vi.fn(),
  DID: class {},
  DIDWithKey: class {},
  RawSigningKey: class {},
}));
vi.mock("@/lib/t3n/sdk", () => ({ getAgentClient: vi.fn() }));
vi.mock("@/lib/t3n/identity", () => ({
  splitDID: vi.fn(),
  getAgentDID: vi.fn(),
}));

import { selectiveDisclose } from "@/lib/t3n/credentials";
import { createCredential } from "../../../tests/factories";

describe("selectiveDisclose", () => {
  it("discloses only the requested fields", () => {
    const credential = createCredential();

    const result = selectiveDisclose(credential, ["blood_type", "allergies"]);

    expect(Object.keys(result.disclosedData).sort()).toEqual([
      "allergies",
      "blood_type",
    ]);
    expect(result.disclosedData.blood_type).toBe("O+");
    expect(result.disclosedData.allergies).toEqual(["Penicillin", "Latex"]);
  });

  it("withholds every field that was not requested", () => {
    const credential = createCredential();

    const result = selectiveDisclose(credential, ["blood_type"]);

    // The privacy claim: sensitive fields are never present in the output.
    expect(result.disclosedData).not.toHaveProperty("active_medications");
    expect(result.disclosedData).not.toHaveProperty("emergency_contact_name");
    expect(result.disclosedData).not.toHaveProperty("emergency_contact_phone");
    expect(result.disclosedData).not.toHaveProperty("allergies");
  });

  it("reports the holder and the requested fields", () => {
    const credential = createCredential();

    const result = selectiveDisclose(credential, ["allergies"]);

    expect(result.holder).toBe(
      "did:t3n:a5d990be0dc8fdea7081b6f849e01ef5d8be1436",
    );
    expect(result.disclosedFields).toEqual(["allergies"]);
    expect(result.vcId).toBe(credential.id.replace(/^urn:uuid:/, ""));
  });

  it("emits BBS+ proof metadata with JSON-pointer reveals", () => {
    const credential = createCredential();

    const result = selectiveDisclose(credential, ["blood_type", "allergies"]);
    const proof = result.proof as {
      cryptosuite: string;
      revealedPointers: string[];
    };

    expect(proof.cryptosuite).toBe("bbs-2023");
    expect(proof.revealedPointers).toEqual([
      "/credentialSubject/blood_type",
      "/credentialSubject/allergies",
    ]);
  });

  it("returns undefined for a requested field absent from the credential", () => {
    const credential = createCredential();
    // Genuinely remove the key so the field is missing, not just empty.
    delete (credential.credentialSubject as unknown as Record<string, unknown>)
      .active_medications;

    const result = selectiveDisclose(credential, ["active_medications"]);

    expect(result.disclosedData.active_medications).toBeUndefined();
    expect(result.disclosedFields).toEqual(["active_medications"]);
  });
});
