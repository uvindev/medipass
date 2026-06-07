/**
 * MediPass — Agent DID Setup (real T3N SDK)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Run: T3N_AGENT_PRIVATE_KEY=0x... pnpm setup:agent
 * (falls back to T3N_DEMO_KEY)
 *
 * Authenticates the agent's Ethereum key against T3N testnet via SIWE and
 * prints the minted did:t3n to put in .env.local as T3N_AGENT_DID.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import {
  T3nClient,
  loadWasmComponent,
  createEthAuthInput,
  eth_get_address,
  metamask_sign,
  setEnvironment,
  getNodeUrl,
} from "@terminal3/t3n-sdk";

const KEY = process.env.T3N_AGENT_PRIVATE_KEY ?? process.env.T3N_DEMO_KEY;
if (!KEY) {
  console.error("ERROR: set T3N_AGENT_PRIVATE_KEY (or T3N_DEMO_KEY)");
  process.exit(1);
}

async function main(): Promise<void> {
  setEnvironment("testnet");
  const key = KEY as string;
  const address = eth_get_address(key);
  console.log("Node:           ", getNodeUrl());
  console.log("Agent ETH addr: ", address);

  const client = new T3nClient({
    wasmComponent: await loadWasmComponent(),
    handlers: { EthSign: metamask_sign(address, undefined, key) },
  });
  await client.handshake();
  const did = await client.authenticate(createEthAuthInput(address));

  console.log("\n============================================================");
  console.log("  ADD TO .env.local:");
  console.log("============================================================");
  console.log(`T3N_AGENT_DID=${did.toString()}`);
  console.log(`T3N_AGENT_PRIVATE_KEY=${key}   # keep secret, never commit`);
  console.log("============================================================");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
