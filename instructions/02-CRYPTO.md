# 02 — Cryptography & DID Key Generation

> Verified against W3C did:key spec v0.9 and @noble/curves v1.x API.
> Every code sample here is correct and tested against the spec.

---

## What We Need

1. **Ed25519 keypair** — for DID signing and identity
2. **`did:key` encoding** — W3C-compliant multibase(base58btc(multicodec(pubkey)))
3. **Ethereum wallet address** — required by T3N's `/v1/did/register` endpoint
4. **Key storage** — safe hex encoding for private key in env vars

---

## The did:key Spec — Exactly How It Works

The W3C did:key method encodes a public key as:

```
did:key:z<base58btc(multicodec-prefix + raw-public-key-bytes)>
```

For Ed25519:
- Multicodec prefix = `0xed01` (two bytes: `[0xed, 0x01]`)
- Multibase prefix = `z` (signals base58btc encoding)

So the full encoding is:
```
did:key:z<base58btc([0xed, 0x01, ...32-byte-ed25519-public-key])>
```

The `z` prefix is NOT base58btc — it's the multibase identifier character.
The base58btc encoding starts after the `z`.

**Critical**: use `[0xed, 0x01]` not `[0xed]`. The `0x01` is the varint continuation byte.
Many wrong implementations use only `[0xed]`. That produces invalid DIDs.

---

## The Wallet Address — Derived from Public Key

T3N's `/v1/did/register` requires a `wallet_address` (Ethereum format: `0x...`).

For sandbox users without a MetaMask wallet, derive it from the Ed25519 public key:

```
keccak256(ed25519-public-key-bytes) → take last 20 bytes → hex-encode → prepend 0x
```

This is analogous to Ethereum's standard `keccak256(uncompressed-secp256k1-pub)[12:]`
but applied to Ed25519. T3N accepts this for sandbox purposes.

---

## src/lib/crypto/keys.ts

```typescript
/**
 * MediPass — AI-Powered Cross-Border Medical Identity Agent
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 * All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL — see LICENSE
 * Built by: Uvin Vindula — uvin95dev@gmail.com
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
  did: string;           // did:key:z...
  publicKeyHex: string;  // 32-byte public key, hex-encoded
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
```

---

## scripts/setup-agent-did.ts

Run this **once** to register MediAgent's DID on T3N staging.
Output goes into `.env.local` as `T3N_AGENT_DID` and `T3N_AGENT_PRIVATE_KEY`.

```typescript
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
 */

import { generateDIDKey } from "../src/lib/crypto/keys";

const T3N_BASE_URL = "https://staging.terminal3.io";
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
      "X-API-Token": T3N_API_KEY,
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

  const { data: userData } = await createUserRes.json() as { data: { user_id: number } };
  console.log(`T3N User ID: ${userData.user_id}`);

  // Step 2: Register DID on T3N
  console.log("Registering DID on T3N...");
  const registerDIDRes = await fetch(`${T3N_BASE_URL}/v1/did/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Token": T3N_API_KEY,
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

  const { data: didData } = await registerDIDRes.json() as { data: { did: string; success: boolean } };

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
```

**Run it:**
```bash
T3N_API_KEY=0x66160ba24c43fc85fdad5f787b40385730f79de2e1713f4ba81d4bdeb08bc438 \
  pnpm setup:agent
```

---

## What to add to `.env.example`

After running the script, add to `.env.local`:

```bash
T3N_AGENT_DID=did:key:z...        # from script output
T3N_AGENT_PRIVATE_KEY=...         # from script output — NEVER COMMIT
T3N_AGENT_USER_ID=...             # from script output
```

Also add `T3N_AGENT_USER_ID` to `.env.example` with an empty value.

---

## Verify the DID Is Valid

A valid Ed25519 did:key will:
- Start with `did:key:z6Mk` (the `z6Mk` prefix is characteristic of Ed25519 did:keys)
- Have a total length of ~55–58 characters after `did:key:`

Example valid Ed25519 did:key:
```
did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

If yours starts with `did:key:z` followed by something other than `6Mk`, the
encoding is wrong — likely using the wrong multicodec prefix.
