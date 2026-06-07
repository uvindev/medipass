/**
 * MediPass — T3N Identity Service (server-only)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Mints real did:t3n identities via the live SDK. A patient identity is a
 * fresh ECDSA keypair authenticated against the network (SIWE) — the resulting
 * did:t3n is the patient's portable medical identity.
 *
 * Verified against testnet: a random ECDSA key authenticates to a did:t3n.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import "server-only";
import { randomKeyEcdsa } from "@terminal3/vc_core";
import { authenticateEthKey, getAgentClient } from "./sdk";

export interface PatientIdentity {
  did: string; // did:t3n:...
  address: string; // derived 0x... ETH address
  privateKeyHex: string; // patient's signing key — returned once, stored by patient
}

function normalizeKey(key: string): string {
  return key.startsWith("0x") ? key : `0x${key}`;
}

/**
 * Generates a fresh ECDSA key and authenticates it against T3N, minting a new
 * did:t3n for the patient. The private key is returned so the patient can keep
 * custody — MediPass does not persist it.
 */
export async function createPatientIdentity(): Promise<PatientIdentity> {
  const privateKeyHex = normalizeKey(randomKeyEcdsa());
  const authed = await authenticateEthKey(privateKeyHex);
  return {
    did: authed.did,
    address: authed.address,
    privateKeyHex,
  };
}

/**
 * The MediPass agent's own did:t3n (issuer identity for credentials).
 */
export async function getAgentDID(): Promise<string> {
  const agent = await getAgentClient();
  return agent.did;
}

/**
 * Splits a did:t3n into [method, identifier] for vc_core's DID classes.
 */
export function splitDID(did: string): [string, string] {
  const parts = did.split(":");
  const method = parts[1] ?? "t3n";
  const identifier = parts.slice(2).join(":");
  return [method, identifier];
}
