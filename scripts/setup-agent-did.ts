/**
 * MediPass — Agent DID Setup Script
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Run: pnpm setup:agent
 *
 * This script:
 * 1. Generates a new Ed25519 keypair
 * 2. Creates a T3N user account for the agent
 * 3. Registers the agent's DID on T3N's blockchain
 * 4. Prints the values to add to .env.local
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { generateDIDKey } from "../src/lib/crypto/keys";

const T3N_BASE_URL = process.env.T3N_BASE_URL ?? "https://staging.terminal3.io";
const T3N_API_KEY = process.env.T3N_API_KEY;

if (!T3N_API_KEY) {
  console.error("ERROR: T3N_API_KEY not set in environment");
  process.exit(1);
}

async function main(): Promise<void> {
  console.log("Generating Ed25519 keypair for MediAgent...");
  const keyPair = generateDIDKey();

  console.log(`DID:            ${keyPair.did}`);
  console.log(`Wallet Address: ${keyPair.walletAddress}`);
  console.log("");

  // Step 1: Create T3N user for the agent
  console.log("Creating T3N user for MediAgent...");
  const createUserRes = await fetch(`${T3N_BASE_URL}/v1/user/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Token": T3N_API_KEY as string,
    },
    body: JSON.stringify({
      profile: {
        first_name: "MediPass",
        last_name: "Agent",
        email_address: `mediagent+${Date.now()}@medipass.iamuvin.com`,
      },
    }),
  });

  if (!createUserRes.ok) {
    const err = await createUserRes.text();
    console.error("Failed to create T3N user:", err);
    process.exit(1);
  }

  const { data: userData } = (await createUserRes.json()) as {
    data: { user_id: number };
  };
  console.log(`T3N User ID: ${userData.user_id}`);

  // Step 2: Register DID on T3N
  console.log("Registering DID on T3N...");
  const registerDIDRes = await fetch(`${T3N_BASE_URL}/v1/did/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Token": T3N_API_KEY as string,
    },
    body: JSON.stringify({
      did: keyPair.did,
      wallet_address: keyPair.walletAddress,
    }),
  });

  if (!registerDIDRes.ok) {
    const err = await registerDIDRes.text();
    console.error("Failed to register DID:", err);
    process.exit(1);
  }

  const { data: didData } = (await registerDIDRes.json()) as {
    data: { did: string; success: boolean };
  };

  if (!didData.success) {
    console.error("DID registration returned success=false");
    process.exit(1);
  }

  console.log("DID registered successfully.");
  console.log("");
  console.log("============================================================");
  console.log("  ADD THESE TO YOUR .env.local:");
  console.log("============================================================");
  console.log("");
  console.log(`T3N_AGENT_DID=${keyPair.did}`);
  console.log(`T3N_AGENT_PRIVATE_KEY=${keyPair.privateKeyHex}`);
  console.log(`T3N_AGENT_USER_ID=${userData.user_id}`);
  console.log("");
  console.log("WARNING: Keep T3N_AGENT_PRIVATE_KEY secret. Never commit it.");
  console.log("============================================================");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
