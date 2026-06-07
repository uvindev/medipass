/**
 * MediPass — Medical Domain Types
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

// Fields that can be selectively disclosed
export type MedicalField =
  | "blood_type"
  | "allergies"
  | "active_medications"
  | "emergency_contact_name"
  | "emergency_contact_phone";

// All MedicalField values — single source of truth for forms + validators.
export const MEDICAL_FIELDS: readonly MedicalField[] = [
  "blood_type",
  "allergies",
  "active_medications",
  "emergency_contact_name",
  "emergency_contact_phone",
] as const;

// Human-readable labels for UI + notifications.
export const MEDICAL_FIELD_LABELS: Record<MedicalField, string> = {
  blood_type: "Blood Type",
  allergies: "Allergies",
  active_medications: "Active Medications",
  emergency_contact_name: "Emergency Contact Name",
  emergency_contact_phone: "Emergency Contact Phone",
};

// All fields — used for patient setup form
export interface MedicalProfile {
  bloodType: string; // e.g. "A+"
  allergies: string[]; // e.g. ["Penicillin", "Latex"]
  activeMedications: string[]; // e.g. ["Metformin 500mg"]
  emergencyContactName: string;
  emergencyContactPhone: string;
}

// After successful VC storage
export interface StoredVC {
  vcId: string; // UUID, used in vcIdFields for presentation
  cid: string; // IPFS CID returned by T3N
  patientDID: string;
  issuedAt: Date;
}

// Result of selective disclosure
export interface SelectivePresentation {
  holder: string; // patient DID
  vcId: string;
  disclosedFields: MedicalField[];
  disclosedData: Partial<Record<MedicalField, unknown>>;
  proof: object; // BBS+ derived proof
  verifiedAt: Date;
}

// Token stored in Supabase authorizing agent access
export interface DataToken {
  id: string;
  patientId: string;
  agentDID: string;
  fields: MedicalField[];
  allowedHosts: string[];
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

// What the doctor UI renders.
// Optionals are `| undefined` so disclosure results (which may omit fields)
// assign cleanly under exactOptionalPropertyTypes.
export interface MedicalSnapshot {
  bloodType?: string | undefined;
  allergies?: string[] | undefined;
  activeMedications?: string[] | undefined;
  verifiedAt: Date;
  issuerDID: string;
  proofValid: boolean;
}
