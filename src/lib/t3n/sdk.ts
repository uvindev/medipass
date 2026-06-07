/**
 * MediPass — Terminal 3 SDK Wrapper (server-only)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * The live T3N ADK is a WASM-backed RPC SDK with SIWE auth — NOT the REST
 * `X-API-Token` API the original brief described. This module owns:
 *   - a cached WASM component (expensive to load; load once per process)
 *   - SIWE authentication of an Ethereum key → a did:t3n
 *   - a cached, authenticated agent client (signs with T3N_AGENT_PRIVATE_KEY)
 *
 * Verified against testnet: handshake + authenticate mints a real did:t3n.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import "server-only";
import {
  T3nClient,
  loadWasmComponent,
  createEthAuthInput,
  eth_get_address,
  metamask_sign,
  setEnvironment,
  getNodeUrl,
  type WasmComponent,
  type Environment,
} from "@terminal3/t3n-sdk";
import { AppError } from "@/lib/errors";

const T3N_ENV = (process.env.T3N_ENV ?? "testnet") as Environment;

// ─── Cached WASM component ─────────────────────────────────────────────────────
// loadWasmComponent() reads + instantiates the jco component; do it once.
let wasmPromise: Promise<WasmComponent> | null = null;

function getWasm(): Promise<WasmComponent> {
  if (!wasmPromise) {
    setEnvironment(T3N_ENV);
    wasmPromise = loadWasmComponent();
  }
  return wasmPromise;
}

export interface AuthedClient {
  did: string; // did:t3n:...
  address: string; // derived 0x... ETH address
  client: T3nClient;
}

/**
 * Authenticates an Ethereum private key against the configured T3N network via
 * the SDK's WASM handshake + SIWE, returning the minted did:t3n and the
 * authenticated client (for subsequent contract calls).
 */
export async function authenticateEthKey(
  privateKeyHex: string,
): Promise<AuthedClient> {
  const key = privateKeyHex.startsWith("0x")
    ? privateKeyHex
    : `0x${privateKeyHex}`;

  let address: string;
  try {
    address = eth_get_address(key);
  } catch (err) {
    throw new AppError("VALIDATION_FAILED", { cause: String(err) }, "Invalid ETH key");
  }

  try {
    const wasmComponent = await getWasm();
    const client = new T3nClient({
      wasmComponent,
      handlers: { EthSign: metamask_sign(address, undefined, key) },
    });
    await client.handshake();
    const did = await client.authenticate(createEthAuthInput(address));
    return { did: did.toString(), address, client };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      "T3N_REQUEST_FAILED",
      { node: getNodeUrl(), cause: String(err) },
      "T3N authentication failed",
    );
  }
}

// ─── Cached agent client ───────────────────────────────────────────────────────
let agentPromise: Promise<AuthedClient> | null = null;

/**
 * The MediPass agent's authenticated T3N session. Signs with the configured
 * agent key and is reused across requests.
 */
export function getAgentClient(): Promise<AuthedClient> {
  if (!agentPromise) {
    const key = process.env.T3N_AGENT_PRIVATE_KEY ?? process.env.T3N_DEMO_KEY;
    if (!key) {
      return Promise.reject(
        new AppError(
          "T3N_REQUEST_FAILED",
          {},
          "T3N_AGENT_PRIVATE_KEY / T3N_DEMO_KEY not configured",
        ),
      );
    }
    agentPromise = authenticateEthKey(key).catch((err: unknown) => {
      agentPromise = null; // allow retry on next call
      throw err;
    });
  }
  return agentPromise;
}

export function getT3NEnvironment(): Environment {
  return T3N_ENV;
}
