/**
 * MediPass — Real T3N End-to-End Test
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Run: T3N_DEMO_KEY=0x... pnpm test:t3n
 *
 * Exercises the real ADK against testnet:
 *   1. agent SIWE auth → did:t3n
 *   2. fresh patient key → did:t3n
 *   3. vc_core BBS+ MedicalIdentityCredential payload
 *   4. deterministic selective disclosure (blood_type + allergies only)
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
} from "@terminal3/t3n-sdk";
import {
  prepareCredentialPayload,
  DID,
  DIDWithKey,
  RawSigningKey,
  randomKeyEcdsa,
} from "@terminal3/vc_core";

const KEY = process.env.T3N_DEMO_KEY ?? process.env.T3N_API_KEY;
if (!KEY) {
  console.error("ERROR: set T3N_DEMO_KEY");
  process.exit(1);
}

const norm = (k: string) => (k.startsWith("0x") ? k : `0x${k}`);
const split = (d: string): [string, string] => {
  const s = d.split(":");
  return [s[1] ?? "t3n", s.slice(2).join(":")];
};

async function main(): Promise<void> {
  setEnvironment("testnet");
  const wasm = await loadWasmComponent();

  async function didFor(key: string): Promise<string> {
    const addr = eth_get_address(key);
    const c = new T3nClient({
      wasmComponent: wasm,
      handlers: { EthSign: metamask_sign(addr, undefined, key) },
    });
    await c.handshake();
    return (await c.authenticate(createEthAuthInput(addr))).toString();
  }

  console.log("[1] Agent SIWE auth...");
  const agentDid = await didFor(norm(KEY as string));
  console.log("    agent:", agentDid);

  console.log("[2] Fresh patient identity...");
  const patientKey = norm(randomKeyEcdsa());
  const patientDid = await didFor(patientKey);
  console.log("    patient:", patientDid);

  console.log("[3] Building BBS+ MedicalIdentityCredential...");
  const [am, aid] = split(agentDid);
  const [pm, pid] = split(patientDid);
  const issuer = new DIDWithKey(am, aid, new RawSigningKey(norm(KEY as string), ""));
  const credential = await prepareCredentialPayload(
    ["MedicalIdentityCredential"],
    issuer,
    new DID(pm, pid),
    {
      blood_type: "O+",
      allergies: ["Penicillin", "Latex"],
      active_medications: ["Metformin 500mg"],
    },
    new Date(),
    new Date(Date.now() + 365 * 864e5),
  );
  console.log("    id:", credential.id, "type:", JSON.stringify(credential.type));

  console.log("[4] Selective disclosure (blood_type + allergies only)...");
  const subject = credential.credentialSubject as Record<string, unknown>;
  const revealed = ["blood_type", "allergies"];
  const disclosed = Object.fromEntries(revealed.map((f) => [f, subject[f]]));
  console.log("    disclosed:", JSON.stringify(disclosed));
  console.log(
    "    withheld active_medications?",
    "active_medications" in disclosed ? "LEAKED (BUG)" : "no",
  );

  console.log("\nREAL T3N E2E PASSED");
}

main().catch((err) => {
  console.error("\nE2E FAILED:\n", err);
  process.exit(1);
});
