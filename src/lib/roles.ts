/**
 * MediPass — Roles (client-safe)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

export type Role = "patient" | "doctor";

export const ROLES: readonly Role[] = ["patient", "doctor"] as const;

export function homeForRole(role: Role): string {
  return role === "doctor" ? "/doctor" : "/patient/dashboard";
}
