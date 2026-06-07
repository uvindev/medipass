/**
 * MediPass — T3N Verifiable Credential Operations
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Handles MedicalIdentityCredential lifecycle:
 * issue → store → present (selective disclosure)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { t3nFetch } from "./client";
import { AppError } from "@/lib/errors";
import type {
  MedicalProfile,
  MedicalField,
  StoredVC,
  SelectivePresentation,
} from "@/types/medical";

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
  if (!AGENT_DID)
    throw new AppError("T3N_VC_STORE_FAILED", {}, "T3N_AGENT_DID not set");

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
    throw new AppError("T3N_VC_STORE_FAILED", {
      patientDID,
      vcId,
      cause: String(err),
    });
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
 * vcIdFields format: { "urn:uuid:<vc-uuid>": ["/credentialSubject/<field>", ...] }
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
      throw new AppError(
        "T3N_VC_PRESENT_FAILED",
        { vcId, fields },
        "No credentials in response",
      );
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
    throw new AppError("T3N_VC_PRESENT_FAILED", {
      vcId,
      fields,
      cause: String(err),
    });
  }
}
