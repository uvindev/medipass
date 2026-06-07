/**
 * MediPass — AI-Powered Cross-Border Medical Identity Agent
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 * All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL — see LICENSE
 * Built by: Uvin Vindula — uvin95dev@gmail.com
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { ed25519 } from "@noble/curves/ed25519";
import { keccak_256 } from "@noble/hashes/sha3";
import { base58btc } from "multiformats/bases/base58";

// ─── Ed25519 multicodec prefix ────────────────────────────────────────────────
// W3C did:key spec: 0xed01 (varint-encoded multicodec for ed25519-pub)
// Reference: https://w3c-ccg.github.io/did-key-spec/
const ED25519_MULTICODEC_PREFIX = new Uint8Array([0xed, 0x01]);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DIDKeyPair {
  did: string; // did:key:z...
  publicKeyHex: string; // 32-byte public key, hex-encoded
  privateKeyHex: string; // 32-byte private key, hex-encoded — KEEP SECRET
  walletAddress: string; // 0x... Ethereum-format, derived from public key
}

// ─── Key generation ───────────────────────────────────────────────────────────

/**
 * Generates a new Ed25519 keypair and derives a W3C-compliant did:key DID.
 *
 * Why Ed25519: fast, secure, 128-bit security level, W3C VC Data Integrity
 * standard uses it, and @noble/curves has 6 independent security audits.
 */
export function generateDIDKey(): DIDKeyPair {
  const privateKeyBytes = ed25519.utils.randomPrivateKey();
  const publicKeyBytes = ed25519.getPublicKey(privateKeyBytes);

  const did = encodeDidKey(publicKeyBytes);
  const walletAddress = deriveWalletAddress(publicKeyBytes);

  return {
    did,
    publicKeyHex: bytesToHex(publicKeyBytes),
    privateKeyHex: bytesToHex(privateKeyBytes),
    walletAddress,
  };
}

/**
 * Reconstructs a DIDKeyPair from a stored private key hex.
 * Use this to reload the agent DID from T3N_AGENT_PRIVATE_KEY env var.
 */
export function loadDIDKeyFromHex(privateKeyHex: string): DIDKeyPair {
  const privateKeyBytes = hexToBytes(privateKeyHex);
  const publicKeyBytes = ed25519.getPublicKey(privateKeyBytes);

  const did = encodeDidKey(publicKeyBytes);
  const walletAddress = deriveWalletAddress(publicKeyBytes);

  return {
    did,
    publicKeyHex: bytesToHex(publicKeyBytes),
    privateKeyHex,
    walletAddress,
  };
}

// ─── Encoding ─────────────────────────────────────────────────────────────────

/**
 * Encodes an Ed25519 public key as a W3C did:key DID.
 *
 * Steps:
 * 1. Prepend multicodec prefix [0xed, 0x01] to public key bytes
 * 2. Base58btc-encode the combined bytes
 * 3. Prepend multibase identifier 'z' (signals base58btc)
 * 4. Prepend 'did:key:'
 *
 * Result: did:key:z<base58btc([0xed, 0x01, ...publicKeyBytes])>
 */
function encodeDidKey(publicKeyBytes: Uint8Array): string {
  const multicodecBytes = new Uint8Array([
    ...ED25519_MULTICODEC_PREFIX,
    ...publicKeyBytes,
  ]);

  // base58btc.encode returns a string WITH the 'z' multibase prefix
  const multibaseEncoded = base58btc.encode(multicodecBytes);

  return `did:key:${multibaseEncoded}`;
}

/**
 * Derives an Ethereum-format wallet address from an Ed25519 public key.
 *
 * T3N's /v1/did/register requires a wallet_address.
 * For email-authenticated users without a wallet, we derive one
 * from the same Ed25519 keypair used for the DID.
 *
 * Method: keccak256(publicKeyBytes) → last 20 bytes → '0x' + hex
 */
function deriveWalletAddress(publicKeyBytes: Uint8Array): string {
  const hash = keccak_256(publicKeyBytes);
  const addressBytes = hash.slice(-20);
  return "0x" + bytesToHex(addressBytes);
}

// ─── Signing ──────────────────────────────────────────────────────────────────

/**
 * Signs a message with an Ed25519 private key.
 * Used for agent authentication and data token issuance.
 */
export function signMessage(
  message: Uint8Array,
  privateKeyHex: string,
): Uint8Array {
  const privateKeyBytes = hexToBytes(privateKeyHex);
  return ed25519.sign(message, privateKeyBytes);
}

/**
 * Verifies an Ed25519 signature.
 */
export function verifySignature(
  signature: Uint8Array,
  message: Uint8Array,
  publicKeyHex: string,
): boolean {
  const publicKeyBytes = hexToBytes(publicKeyHex);
  return ed25519.verify(signature, message, publicKeyBytes);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error(`Invalid hex string length: ${clean.length}`);
  }
  return new Uint8Array(
    Array.from({ length: clean.length / 2 }, (_, i) =>
      parseInt(clean.slice(i * 2, i * 2 + 2), 16),
    ),
  );
}
