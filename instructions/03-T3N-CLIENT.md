# 03 — T3N API Integration Layer

> All endpoints verified against live T3N staging docs.
> Auth: `X-API-Token` header — NOT `Authorization: Bearer`.
> Base URL: `https://staging.terminal3.io`

---

## src/lib/errors.ts

Build this first — everything else depends on it.

```typescript
/**
 * MediPass — Structured Error Types
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

export type ErrorCode =
  | "T3N_REQUEST_FAILED"
  | "T3N_USER_CREATE_FAILED"
  | "T3N_DID_REGISTER_FAILED"
  | "T3N_VC_STORE_FAILED"
  | "T3N_VC_PRESENT_FAILED"
  | "T3N_WALLET_FETCH_FAILED"
  | "AGENT_TOOL_FAILED"
  | "AGENT_TOKEN_EXPIRED"
  | "AGENT_TOKEN_REVOKED"
  | "AGENT_DID_NOT_FOUND"
  | "CANARY_SEND_FAILED"
  | "NOTIFICATION_FAILED"
  | "DB_WRITE_FAILED"
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly context: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    context: Record<string, unknown> = {},
    message?: string,
  ) {
    super(message ?? code);
    this.code = code;
    this.context = context;
    this.name = "AppError";
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
```

---

## src/lib/t3n/client.ts

```typescript
/**
 * MediPass — T3N API Client
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Typed wrapper around the Terminal 3 staging API.
 * All requests use X-API-Token header (not Bearer).
 * All errors throw AppError — never swallowed.
 */

import { AppError } from "@/lib/errors";

const T3N_BASE_URL = process.env.T3N_BASE_URL ?? "https://staging.terminal3.io";
const T3N_API_KEY = process.env.T3N_API_KEY;

// ─── Types ───────────────────────────────────────────────────────────────────

interface T3NErrorResponse {
  errors: Array<{ code: string; message: string }>;
}

// ─── Base fetch ───────────────────────────────────────────────────────────────

/**
 * All T3N API calls go through here.
 * - Adds X-API-Token header
 * - Parses JSON response
 * - Throws AppError on non-2xx
 *
 * Why proxy through here: T3N_API_KEY must never appear in client-side code.
 * This function only runs server-side (API routes, Server Actions).
 */
export async function t3nFetch<TResponse>(
  path: string,
  options: RequestInit = {},
  subClientId?: string,
): Promise<TResponse> {
  if (!T3N_API_KEY) {
    throw new AppError("T3N_REQUEST_FAILED", {}, "T3N_API_KEY not configured");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Token": T3N_API_KEY,
    ...(subClientId ? { "X-API-SubClient-ID": subClientId } : {}),
    ...(options.headers as Record<string, string> | undefined ?? {}),
  };

  const response = await fetch(`${T3N_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorBody: T3NErrorResponse | null = null;
    try {
      errorBody = (await response.json()) as T3NErrorResponse;
    } catch {
      // non-JSON error body — ignore
    }

    throw new AppError("T3N_REQUEST_FAILED", {
      path,
      status: response.status,
      statusText: response.statusText,
      errors: errorBody?.errors ?? [],
    });
  }

  return response.json() as Promise<TResponse>;
}
```

---

## src/lib/t3n/users.ts

```typescript
/**
 * MediPass — T3N User Operations
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { t3nFetch } from "./client";
import { AppError } from "@/lib/errors";
import type { T3NCreateUserRequest, T3NCreateUserResponse } from "@/types/t3n";

/**
 * Creates a T3N user account for a patient.
 *
 * T3N generates a custodial wallet and stores the profile
 * encrypted in their decentralized storage network.
 * Returns a numeric user_id used for all subsequent API calls.
 */
export async function createT3NUser(
  params: T3NCreateUserRequest,
): Promise<number> {
  try {
    const res = await t3nFetch<T3NCreateUserResponse>("/v1/user/create", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return res.data.user_id;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("T3N_USER_CREATE_FAILED", { params, cause: String(err) });
  }
}

/**
 * Retrieves wallet addresses associated with a T3N user.
 * Used to verify wallet association after DID registration.
 */
export async function getWalletAddresses(
  userId: number,
): Promise<Array<{ wallet_address: string; primary: boolean; type: "account" | "linked" }>> {
  interface WalletRes {
    data: Array<{ wallet_address: string; primary: boolean; type: "account" | "linked" }>;
  }

  try {
    const res = await t3nFetch<WalletRes>(`/v1/user/${userId}/wallet_addresses`);
    return res.data;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("T3N_WALLET_FETCH_FAILED", { userId, cause: String(err) });
  }
}
```

---

## src/lib/t3n/did.ts

```typescript
/**
 * MediPass — T3N DID Operations
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
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
    throw new AppError("T3N_DID_REGISTER_FAILED", { did }, "Only did:key is supported");
  }

  try {
    const res = await t3nFetch<RegisterDIDResponse>("/v1/did/register", {
      method: "POST",
      body: JSON.stringify({ did, wallet_address: walletAddress } satisfies RegisterDIDRequest),
    });

    if (!res.data.success) {
      throw new AppError("T3N_DID_REGISTER_FAILED", { did, walletAddress });
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("T3N_DID_REGISTER_FAILED", { did, cause: String(err) });
  }
}
```

---

## src/lib/t3n/credentials.ts

```typescript
/**
 * MediPass — T3N Verifiable Credential Operations
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Handles MedicalIdentityCredential lifecycle:
 * issue → store → present (selective disclosure)
 */

import { t3nFetch } from "./client";
import { AppError } from "@/lib/errors";
import type { MedicalProfile, MedicalField, StoredVC, SelectivePresentation } from "@/types/medical";

const AGENT_DID = process.env.T3N_AGENT_DID;

// ─── VC Schema ────────────────────────────────────────────────────────────────

/**
 * Builds the unsigned MedicalIdentityCredential JSON-LD.
 *
 * Why W3C VC Data Model v2 (@context v2):
 * T3N's store endpoint expects the v2 context URL.
 * The proof skeleton is required but left empty — T3N fills it with BBS+.
 */
function buildMedicalVC(
  patientDID: string,
  profile: MedicalProfile,
  vcId: string,
): object {
  if (!AGENT_DID) throw new AppError("T3N_VC_STORE_FAILED", {}, "T3N_AGENT_DID not set");

  const now = new Date();
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 1);

  return {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    id: `urn:uuid:${vcId}`,
    type: ["VerifiableCredential", "MedicalIdentityCredential"],
    issuer: AGENT_DID,
    validFrom: now.toISOString(),
    validUntil: expiry.toISOString(),
    credentialSubject: {
      id: patientDID,
      blood_type: profile.bloodType,
      allergies: profile.allergies,
      active_medications: profile.activeMedications,
      emergency_contact_name: profile.emergencyContactName,
      emergency_contact_phone: profile.emergencyContactPhone,
    },
    proof: {
      // T3N fills this in during store — BBS+ DataIntegrityProof
      type: "DataIntegrityProof",
      cryptosuite: "bbs-2023",
      proofPurpose: "assertionMethod",
      verificationMethod: AGENT_DID,
      created: now.toISOString(),
      proofValue: "", // T3N replaces this
    },
  };
}

// ─── Store VC ─────────────────────────────────────────────────────────────────

interface StoreVCResponse {
  data: { cid: string; vc: object };
}

/**
 * Issues and stores a MedicalIdentityVC on T3N.
 *
 * Flow:
 * 1. Build unsigned VC with patient claims
 * 2. POST to T3N /v1/vc/issuer/store
 * 3. T3N signs with BBS+ inside TEE
 * 4. T3N stores on IPFS, returns CID
 * 5. We store (vcId, cid) in Supabase for later presentation
 *
 * Rate limit: 20 req/s — add delay if issuing in bulk
 */
export async function storeMedicalVC(
  patientDID: string,
  profile: MedicalProfile,
): Promise<StoredVC> {
  const vcId = crypto.randomUUID();
  const vc = buildMedicalVC(patientDID, profile, vcId);

  try {
    const res = await t3nFetch<StoreVCResponse>("/v1/vc/issuer/store", {
      method: "POST",
      body: JSON.stringify({ vc }),
    });

    return {
      vcId,
      cid: res.data.cid,
      patientDID,
      issuedAt: new Date(),
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("T3N_VC_STORE_FAILED", { patientDID, vcId, cause: String(err) });
  }
}

// ─── Selective Presentation ───────────────────────────────────────────────────

interface PresentationResponse {
  data: {
    holder: string;
    credentials: Array<{
      id: string;
      type: string[];
      credentialSubject: Record<string, unknown>;
      proof: object;
    }>;
  };
}

/**
 * Generates a BBS+ selective disclosure presentation.
 *
 * This is the core of MediPass's privacy guarantee.
 * The doctor requests ["blood_type", "allergies"].
 * T3N's TEE:
 *   1. Decrypts the full VC inside the enclave
 *   2. Runs BBS+ derivation for only the requested fields
 *   3. Returns a NEW proof covering ONLY those fields
 *
 * The agent receives blood_type and allergies.
 * The agent NEVER sees active_medications, emergency_contact, etc.
 * The BBS+ proof mathematically guarantees no other fields were disclosed.
 *
 * vcIdFields format: { "<vc-uuid>": ["/credentialSubject/<field>", ...] }
 */
export async function generateSelectivePresentation(
  vcId: string,
  fields: MedicalField[],
): Promise<SelectivePresentation> {
  // Map field names to JSON Pointer paths
  const fieldPaths = fields.map((f) => `/credentialSubject/${f}`);

  const vcIdFields: Record<string, string[]> = {
    [`urn:uuid:${vcId}`]: fieldPaths,
  };

  try {
    const res = await t3nFetch<PresentationResponse>(
      "/v1/vc/issuer/credentials/proof",
      {
        method: "POST",
        body: JSON.stringify({ vcIdFields }),
      },
    );

    const credential = res.data.credentials[0];
    if (!credential) {
      throw new AppError("T3N_VC_PRESENT_FAILED", { vcId, fields }, "No credentials in response");
    }

    // Extract only the requested fields from credentialSubject
    const disclosedData: Partial<Record<MedicalField, unknown>> = {};
    for (const field of fields) {
      disclosedData[field] = credential.credentialSubject[field];
    }

    return {
      holder: res.data.holder,
      vcId,
      disclosedFields: fields,
      disclosedData,
      proof: credential.proof,
      verifiedAt: new Date(),
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("T3N_VC_PRESENT_FAILED", { vcId, fields, cause: String(err) });
  }
}
```

---

## src/types/t3n.ts

```typescript
/**
 * MediPass — T3N API Types
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

// ─── User ─────────────────────────────────────────────────────────────────────

export interface T3NCreateUserRequest {
  wallet?: {
    address: string;
    chain_id: string;
  };
  profile: {
    first_name: string;
    last_name: string;
    email_address: string;
    date_of_birth?: string;
    gender?: "male" | "female" | "other_gender" | "unknown_gender";
    residence_country?: string;
  };
}

export interface T3NCreateUserResponse {
  data: {
    user_id: number;
  };
}

// ─── DID ──────────────────────────────────────────────────────────────────────

export interface T3NRegisterDIDRequest {
  did: string;
  wallet_address: string;
}

export interface T3NRegisterDIDResponse {
  data: {
    did: string;
    success: boolean;
  };
}
```

---

## src/types/medical.ts

```typescript
/**
 * MediPass — Medical Domain Types
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

// Fields that can be selectively disclosed
export type MedicalField =
  | "blood_type"
  | "allergies"
  | "active_medications"
  | "emergency_contact_name"
  | "emergency_contact_phone";

// All fields — used for patient setup form
export interface MedicalProfile {
  bloodType: string;       // e.g. "A+"
  allergies: string[];     // e.g. ["Penicillin", "Latex"]
  activeMedications: string[];  // e.g. ["Metformin 500mg"]
  emergencyContactName: string;
  emergencyContactPhone: string;
}

// After successful VC storage
export interface StoredVC {
  vcId: string;       // UUID, used in vcIdFields for presentation
  cid: string;        // IPFS CID returned by T3N
  patientDID: string;
  issuedAt: Date;
}

// Result of selective disclosure
export interface SelectivePresentation {
  holder: string;     // patient DID
  vcId: string;
  disclosedFields: MedicalField[];
  disclosedData: Partial<Record<MedicalField, unknown>>;
  proof: object;      // BBS+ derived proof
  verifiedAt: Date;
}

// Token stored in Supabase authorizing agent access
export interface DataToken {
  id: string;
  patientId: string;
  agentDID: string;
  fields: MedicalField[];
  allowedHosts: string[];
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

// What the doctor UI renders
export interface MedicalSnapshot {
  bloodType?: string;
  allergies?: string[];
  activeMedications?: string[];
  verifiedAt: Date;
  issuerDID: string;
  proofValid: boolean;
}
```

---

## src/lib/watermark.ts

```typescript
/**
 * MediPass — HTTP Response Watermarks
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

// Add to every API route NextResponse
export const ownershipHeaders: Record<string, string> = {
  "X-Built-By": "Uvin Vindula — IAMUVIN (iamuvin.com)",
  "X-Copyright": "Copyright (c) 2026 Uvin Vindula. All Rights Reserved.",
  "X-License": "Proprietary — See github.com/iamuvin/medipass/LICENSE",
};

// robots.txt — blocks AI scrapers
export const robotsTxt = `
User-agent: *
Disallow: /api/

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /
`.trim();
```

---

## Key Learning: T3N Response Shape

Every T3N response wraps data in a `data` key:

```json
{
  "data": {
    "user_id": 42
  }
}
```

Every T3N error response uses an `errors` array:

```json
{
  "errors": [
    { "code": "VALIDATION_ERROR", "message": "email_address is required" }
  ]
}
```

Never assume the shape — always type the response and access `.data` explicitly.
The `t3nFetch` base client handles the error case. Individual functions handle the `.data` access.
