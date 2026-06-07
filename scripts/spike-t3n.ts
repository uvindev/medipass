/**
 * MediPass — Real T3N SDK Spike
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Throwaway: proves the testnet key authenticates against the live T3N ADK via
 * @terminal3/t3n-sdk (WASM + SIWE). Run:
 *   T3N_DEMO_KEY=0x... pnpm tsx scripts/spike-t3n.ts
 */

import {
  T3nClient,
  loadWasmComponent,
  createEthAuthInput,
  eth_get_address,
  metamask_sign,
  setEnvironment,
  getNodeUrl,
  NODE_URLS,
} from "@terminal3/t3n-sdk";

const KEY = process.env.T3N_DEMO_KEY ?? process.env.T3N_API_KEY;
if (!KEY) {
  console.error("ERROR: set T3N_DEMO_KEY (or T3N_API_KEY)");
  process.exit(1);
}

async function main(): Promise<void> {
  setEnvironment("testnet");
  console.log("NODE_URLS.testnet:", NODE_URLS.testnet);
  console.log("resolved node:    ", getNodeUrl());

  const key = KEY as string;
  const address = eth_get_address(key);
  console.log("derived eth addr: ", address);

  console.log("\nLoading WASM component...");
  const wasmComponent = await loadWasmComponent();

  const client = new T3nClient({
    wasmComponent,
    handlers: {
      EthSign: metamask_sign(address, undefined, key),
    },
  });

  console.log("Handshaking with T3N node...");
  await client.handshake();
  console.log("  handshake OK");

  console.log("Authenticating (SIWE)...");
  const did = await client.authenticate(createEthAuthInput(address));
  console.log("  DID:", did);

  console.log("\nSPIKE PASSED — testnet key authenticates against live T3N.");
}

main().catch((err) => {
  console.error("\nSPIKE FAILED:\n", err);
  process.exit(1);
});
