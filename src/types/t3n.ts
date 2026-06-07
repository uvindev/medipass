/**
 * MediPass — T3N API Types
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

// ─── User ─────────────────────────────────────────────────────────────────────

export interface T3NCreateUserRequest {
  wallet?: {
    address: string;
    chain_id: string;
  };
  profile: {
    first_name: string;
    last_name: string;
    email_address: string;
    date_of_birth?: string;
    gender?: "male" | "female" | "other_gender" | "unknown_gender";
    residence_country?: string;
  };
}

export interface T3NCreateUserResponse {
  data: {
    user_id: number;
  };
}

// ─── DID ──────────────────────────────────────────────────────────────────────

export interface T3NRegisterDIDRequest {
  did: string;
  wallet_address: string;
}

export interface T3NRegisterDIDResponse {
  data: {
    did: string;
    success: boolean;
  };
}
