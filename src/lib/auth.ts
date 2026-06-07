/**
 * MediPass — Auth Helpers
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Roles + server-side session access. Role + display name live in the Supabase
 * user metadata, set at sign-up.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import "server-only";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServer } from "./supabase/server";
import type { Role } from "./roles";

export type { Role } from "./roles";
export { homeForRole } from "./roles";

export interface AuthedUser {
  id: string;
  email: string;
  role: Role;
  name: string;
  hospital?: string | undefined;
  clinicianType?: string | undefined;
  country?: string | undefined;
  specialty?: string | undefined;
  hospitals?: string[] | undefined;
}

export function roleOf(user: User | null): Role | null {
  const role = user?.user_metadata?.["role"];
  return role === "patient" || role === "doctor" ? role : null;
}

/** The current authenticated user (or null). Reads cookies server-side. */
export async function getSessionUser(): Promise<AuthedUser | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = roleOf(user);
  if (!user || !role || !user.email) return null;

  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email,
    role,
    name: (meta["name"] as string) ?? user.email,
    hospital: meta["hospital"] as string | undefined,
    clinicianType: meta["clinician_type"] as string | undefined,
    country: meta["country"] as string | undefined,
    specialty: meta["specialty"] as string | undefined,
    hospitals: meta["hospitals"] as string[] | undefined,
  };
}
