/**
 * MediPass — Test Data Factories
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import type { CredentialPayload } from "@terminal3/vc_core";

let seq = 0;

/** A fully-populated W3C 2.0 MedicalIdentityCredential payload. */
export function createCredential(
  overrides: Partial<CredentialPayload> & {
    subject?: Record<string, unknown>;
  } = {},
): CredentialPayload {
  seq += 1;
  const { subject, ...rest } = overrides;
  return {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    id: `urn:uuid:0000000${seq}-0000-4000-8000-000000000000`,
    issuer: "did:t3n:e8f80523a3b184a4efd455791312c393185b492f",
    type: ["VerifiableCredential", "MedicalIdentityCredential"],
    validFrom: "2026-06-07T00:00:00.000Z",
    validUntil: "2027-06-07T00:00:00.000Z",
    credentialSubject: {
      id: "did:t3n:a5d990be0dc8fdea7081b6f849e01ef5d8be1436",
      blood_type: "O+",
      allergies: ["Penicillin", "Latex"],
      active_medications: ["Metformin 500mg"],
      emergency_contact_name: "Jane Doe",
      emergency_contact_phone: "+65 9123 4567",
      ...subject,
    } as CredentialPayload["credentialSubject"],
    ...rest,
  };
}
