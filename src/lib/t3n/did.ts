/**
 * MediPass — T3N DID Operations
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { t3nFetch } from "./client";
import { AppError } from "@/lib/errors";

interface RegisterDIDRequest {
  did: string;
  wallet_address: string;
}

interface RegisterDIDResponse {
  data: { did: string; success: boolean };
}

/**
 * Registers a did:key DID on T3N's on-chain DID Registry.
 *
 * Notes:
 * - T3N staging supports ONLY did:key (static DID method)
 * - wallet_address must be Ethereum-format (0x...)
 * - Registration is idempotent — registering the same DID twice is safe
 */
export async function registerDID(
  did: string,
  walletAddress: string,
): Promise<void> {
  if (!did.startsWith("did:key:")) {
    throw new AppError(
      "T3N_DID_REGISTER_FAILED",
      { did },
      "Only did:key is supported",
    );
  }

  try {
    const res = await t3nFetch<RegisterDIDResponse>("/v1/did/register", {
      method: "POST",
      body: JSON.stringify({
        did,
        wallet_address: walletAddress,
      } satisfies RegisterDIDRequest),
    });

    if (!res.data.success) {
      throw new AppError("T3N_DID_REGISTER_FAILED", { did, walletAddress });
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("T3N_DID_REGISTER_FAILED", { did, cause: String(err) });
  }
}
