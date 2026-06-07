/**
 * MediPass — T3N User Operations
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { t3nFetch } from "./client";
import { AppError } from "@/lib/errors";
import type { T3NCreateUserRequest, T3NCreateUserResponse } from "@/types/t3n";

/**
 * Creates a T3N user account for a patient.
 *
 * T3N generates a custodial wallet and stores the profile
 * encrypted in their decentralized storage network.
 * Returns a numeric user_id used for all subsequent API calls.
 */
export async function createT3NUser(
  params: T3NCreateUserRequest,
): Promise<number> {
  try {
    const res = await t3nFetch<T3NCreateUserResponse>("/v1/user/create", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return res.data.user_id;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("T3N_USER_CREATE_FAILED", {
      params,
      cause: String(err),
    });
  }
}

/**
 * Retrieves wallet addresses associated with a T3N user.
 * Used to verify wallet association after DID registration.
 */
export async function getWalletAddresses(
  userId: number,
): Promise<
  Array<{ wallet_address: string; primary: boolean; type: "account" | "linked" }>
> {
  interface WalletRes {
    data: Array<{
      wallet_address: string;
      primary: boolean;
      type: "account" | "linked";
    }>;
  }

  try {
    const res = await t3nFetch<WalletRes>(`/v1/user/${userId}/wallet_addresses`);
    return res.data;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("T3N_WALLET_FETCH_FAILED", {
      userId,
      cause: String(err),
    });
  }
}
