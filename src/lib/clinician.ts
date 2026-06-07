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
  "Allergy & Immunology",
  "Anesthesiology",
  "Cardiology",
  "Cardiothoracic Surgery",
  "Critical Care",
  "Dentistry",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Practice",
  "General Surgery",
  "Genetics",
  "Geriatrics",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Nephrology",
  "Neonatology",
  "Neurology",
  "Neurosurgery",
  "Nuclear Medicine",
  "Obstetrics & Gynecology",
  "Occupational Medicine",
  "Oncology",
  "Ophthalmology",
  "Oral & Maxillofacial Surgery",
  "Orthopedics",
  "Otolaryngology (ENT)",
  "Pain Management",
  "Palliative Care",
  "Pathology",
  "Pediatrics",
  "Physical Medicine & Rehabilitation",
  "Plastic Surgery",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Sports Medicine",
  "Urology",
  "Vascular Surgery",
] as const;
