/**
 * MediPass — Medical Domain Tests
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { describe, it, expect } from "vitest";
import {
  MEDICAL_FIELDS,
  MEDICAL_FIELD_LABELS,
  type MedicalField,
} from "@/types/medical";

describe("medical field registry", () => {
  it("defines the five disclosable fields", () => {
    expect(MEDICAL_FIELDS).toEqual([
      "blood_type",
      "allergies",
      "active_medications",
      "emergency_contact_name",
      "emergency_contact_phone",
    ]);
  });

  it("has a human label for every field", () => {
    for (const field of MEDICAL_FIELDS) {
      expect(MEDICAL_FIELD_LABELS[field]).toBeTruthy();
    }
  });

  it("has no orphan labels (labels exactly cover the fields)", () => {
    const labelKeys = Object.keys(MEDICAL_FIELD_LABELS) as MedicalField[];
    expect(labelKeys.sort()).toEqual([...MEDICAL_FIELDS].sort());
  });
});
