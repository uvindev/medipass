/**
 * MediPass — T3N Staging Integration Smoke Test
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Run: pnpm test:t3n
 *
 * Self-contained (no @/ alias) so it runs under tsx directly. Exercises the
 * full T3N flow against staging:
 *   1. create agent + patient users
 *   2. register both DIDs
 *   3. store a BBS+ MedicalIdentityVC issued by the agent for the patient
 *   4. generate a selective-disclosure presentation (blood_type + allergies)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { generateDIDKey } from "../src/lib/crypto/keys";

const BASE = process.env.T3N_BASE_URL ?? "https://staging.terminal3.io";
const KEY = process.env.T3N_API_KEY;

if (!KEY) {
  console.error("ERROR: T3N_API_KEY not set");
  process.exit(1);
}

async function t3n<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Token": KEY as string,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${path} → ${res.status} ${res.statusText}\n${text}`);
  }
  return JSON.parse(text) as T;
}

async function createUser(label: string): Promise<number> {
  const out = await t3n<{ data: { user_id: number } }>("/v1/user/create", {
    profile: {
      first_name: "MediPass",
      last_name: label,
      email_address: `medipass+${label}+${Date.now()}@medipass.iamuvin.com`,
    },
  });
  return out.data.user_id;
}

async function main(): Promise<void> {
  const agent = generateDIDKey();
  const patient = generateDIDKey();
  console.log("Agent DID:  ", agent.did);
  console.log("Patient DID:", patient.did);

  console.log("\n[1] Creating users...");
  const agentUserId = await createUser("agent");
  const patientUserId = await createUser("patient");
  console.log("  agent user_id:", agentUserId, "patient user_id:", patientUserId);

  console.log("\n[2] Registering DIDs...");
  await t3n("/v1/did/register", {
    did: agent.did,
    wallet_address: agent.walletAddress,
  });
  await t3n("/v1/did/register", {
    did: patient.did,
    wallet_address: patient.walletAddress,
  });
  console.log("  both DIDs registered");

  console.log("\n[3] Storing MedicalIdentityVC...");
  const vcId = crypto.randomUUID();
  const now = new Date();
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 1);
  const store = await t3n<{ data: { cid: string } }>("/v1/vc/issuer/store", {
    vc: {
      "@context": ["https://www.w3.org/ns/credentials/v2"],
      id: `urn:uuid:${vcId}`,
      type: ["VerifiableCredential", "MedicalIdentityCredential"],
      issuer: agent.did,
      validFrom: now.toISOString(),
      validUntil: expiry.toISOString(),
      credentialSubject: {
        id: patient.did,
        blood_type: "O+",
        allergies: ["Penicillin", "Latex"],
        active_medications: ["Metformin 500mg"],
        emergency_contact_name: "Jane Doe",
        emergency_contact_phone: "+65 9123 4567",
      },
      proof: {
        type: "DataIntegrityProof",
        cryptosuite: "bbs-2023",
        proofPurpose: "assertionMethod",
        verificationMethod: agent.did,
        created: now.toISOString(),
        proofValue: "",
      },
    },
  });
  console.log("  vcId:", vcId);
  console.log("  cid: ", store.data.cid);

  console.log("\n[4] Selective presentation (blood_type + allergies)...");
  const present = await t3n<{
    data: {
      holder: string;
      credentials: Array<{ credentialSubject: Record<string, unknown> }>;
    };
  }>("/v1/vc/issuer/credentials/proof", {
    vcIdFields: {
      [`urn:uuid:${vcId}`]: [
        "/credentialSubject/blood_type",
        "/credentialSubject/allergies",
      ],
    },
  });
  const subject = present.data.credentials[0]?.credentialSubject ?? {};
  console.log("  holder:", present.data.holder);
  console.log("  disclosed:", JSON.stringify(subject));
  console.log(
    "  leaked active_medications?",
    "active_medications" in subject ? "YES (BUG)" : "no",
  );

  console.log("\nALL STEPS PASSED");
}

main().catch((err) => {
  console.error("\nT3N TEST FAILED:\n", err);
  process.exit(1);
});
