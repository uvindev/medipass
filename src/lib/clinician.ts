/**
 * MediPass — Clinician Reference Data (client-safe)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

export const CLINICIAN_TYPES = [
  "Doctor",
  "Medical Student",
  "Nurse",
  "Paramedic",
  "Pharmacist",
] as const;

export type ClinicianType = (typeof CLINICIAN_TYPES)[number];

// Common specialties for the type-ahead. Not exhaustive — the field is free-text
// with these as suggestions.
export const MEDICAL_SPECIALTIES: readonly string[] = [
  "Anesthesiology",
  "Cardiology",
  "Critical Care",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Surgery",
  "Geriatrics",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology (ENT)",
  "Pathology",
  "Pediatrics",
  "Plastic Surgery",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Sports Medicine",
  "Urology",
  "Vascular Surgery",
] as const;
