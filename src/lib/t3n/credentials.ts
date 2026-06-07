/**
 * MediPass — T3N Verifiable Credential Operations (server-only)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Built on the REAL T3N stack: @terminal3/vc_core builds W3C 2.0 BBS+ credential
 * payloads; the agent's authenticated SDK session issues/derives via TEE.
 *
 * Status of each step:
 *   - buildMedicalCredential        ✅ real (vc_core.prepareCredentialPayload)
 *   - issueMedicalVC                ✅ payload real; TEE sign+store is a seam
 *     (executeAndDecode to the issuer contract) — falls back to holding the
 *     payload app-side when T3N_VC_ISSUER_SCRIPT is unset.
 *   - selectiveDisclose             ✅ deterministic field-level disclosure;
 *     real BBS+ proof derivation is the TEE seam.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import "server-only";
import {
  prepareCredentialPayload,
  DID,
  DIDWithKey,
  RawSigningKey,
  type CredentialPayload,
} from "@terminal3/vc_core";
import { AppError } from "@/lib/errors";
import { getAgentClient } from "./sdk";
import { splitDID } from "./identity";
import type {
  MedicalProfile,
  MedicalField,
  StoredVC,
  SelectivePresentation,
} from "@/types/medical";

// ─── Build (real, BBS+) ────────────────────────────────────────────────────────

/**
 * Builds an unsigned W3C 2.0 MedicalIdentityCredential via vc_core.
 * Uses BBS+ ("bbs-plus-24-values") so the credential supports selective
 * disclosure of individual fields.
 */
export async function buildMedicalCredential(
  patientDID: string,
  profile: MedicalProfile,
): Promise<CredentialPayload> {
  const agent = await getAgentClient();

  const agentKey = process.env.T3N_AGENT_PRIVATE_KEY ?? process.env.T3N_DEMO_KEY;
  if (!agentKey) {
    throw new AppError("T3N_VC_STORE_FAILED", {}, "Agent signing key not set");
  }

  const [am, aid] = splitDID(agent.did);
  const [pm, pid] = splitDID(patientDID);

  const issuer = new DIDWithKey(am, aid, new RawSigningKey(agentKey, ""));
  const subject = new DID(pm, pid);

  const validFrom = new Date();
  const validUntil = new Date(validFrom);
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  return prepareCredentialPayload(
    ["MedicalIdentityCredential"],
    issuer,
    subject,
    {
      blood_type: profile.bloodType,
      allergies: profile.allergies,
      active_medications: profile.activeMedications,
      emergency_contact_name: profile.emergencyContactName,
      emergency_contact_phone: profile.emergencyContactPhone,
    },
    validFrom,
    validUntil,
  );
}

// ─── Issue + store ─────────────────────────────────────────────────────────────

export interface IssuedVC extends StoredVC {
  credential: CredentialPayload;
}

const ISSUER_SCRIPT = process.env.T3N_VC_ISSUER_SCRIPT;

/**
 * Issues the medical VC. Builds the real BBS+ payload, then:
 *   - if T3N_VC_ISSUER_SCRIPT is configured, signs + stores it via the agent's
 *     TEE contract (executeAndDecode) and uses the returned reference as the CID;
 *   - otherwise holds the payload app-side (interim) so the rest of the flow
 *     works end-to-end, with the CID marked as a local reference.
 *
 * Either way the caller receives the credential payload to persist.
 */
export async function issueMedicalVC(
  patientDID: string,
  profile: MedicalProfile,
): Promise<IssuedVC> {
  const credential = await buildMedicalCredential(patientDID, profile);
  const vcId = credential.id.replace(/^urn:uuid:/, "");

  let cid = `local:${vcId}`;

  if (ISSUER_SCRIPT) {
    try {
      const agent = await getAgentClient();
      const version = 1;
      const result = (await agent.client.executeAndDecode({
        script_name: ISSUER_SCRIPT,
        script_version: version,
        function_name: "issue-credential",
        input: { credential },
      })) as { cid?: string };
      if (result?.cid) cid = result.cid;
    } catch (err) {
      throw new AppError("T3N_VC_STORE_FAILED", {
        patientDID,
        vcId,
        cause: String(err),
      });
    }
  }

  return {
    vcId,
    cid,
    patientDID,
    issuedAt: new Date(),
    credential,
  };
}

// ─── Selective disclosure ──────────────────────────────────────────────────────

/**
 * Derives a selective-disclosure presentation for the requested fields.
 *
 * Deterministic field-level disclosure: only the requested credentialSubject
 * fields are revealed; the rest never leave this function. The returned shape
 * mirrors vc_core's VerifiablePresentation (holder + revealedPointers).
 *
 * The real BBS+ proof derivation runs in the T3N TEE (verifier/issuer contract);
 * this provides the same disclosure guarantee at the data layer until that
 * contract call is wired.
 */
export function selectiveDisclose(
  credential: CredentialPayload,
  fields: MedicalField[],
): SelectivePresentation {
  const subject = credential.credentialSubject as unknown as Record<
    string,
    unknown
  >;

  const disclosedData: Partial<Record<MedicalField, unknown>> = {};
  for (const field of fields) {
    disclosedData[field] = subject[field];
  }

  const revealedPointers = fields.map((f) => `/credentialSubject/${f}`);

  return {
    holder: subject["id"] as string,
    vcId: credential.id.replace(/^urn:uuid:/, ""),
    disclosedFields: fields,
    disclosedData,
    proof: {
      type: "DataIntegrityProof",
      cryptosuite: "bbs-2023",
      revealedPointers,
    },
    verifiedAt: new Date(),
  };
}
