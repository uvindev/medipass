/**
 * MediPass — Emergency Card Helpers (server-only)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * The emergency card exposes a minimal, patient-chosen subset publicly via the
 * QR code: name, blood group, allergies, and the emergency contact. Everything
 * else stays behind selective disclosure.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import "server-only";

export function newPublicId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

export interface EmergencyInfo {
  fullName: string;
  bloodType: string;
  allergies: string[];
  contactName: string;
  contactPhone: string;
}

export function emergencyFromCredential(
  credential: unknown,
  fullName: string | null,
): EmergencyInfo {
  const subject =
    (credential as { credentialSubject?: Record<string, unknown> } | null)
      ?.credentialSubject ?? {};
  return {
    fullName: fullName?.trim() || "MediPass patient",
    bloodType: (subject["blood_type"] as string) || "—",
    allergies: (subject["allergies"] as string[]) || [],
    contactName: (subject["emergency_contact_name"] as string) || "",
    contactPhone: (subject["emergency_contact_phone"] as string) || "",
  };
}
