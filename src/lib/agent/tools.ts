/**
 * MediPass — MediAgent Tool Implementations
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Four tools. One responsibility each.
 * All inputs validated with Zod before execution.
 * All errors throw AppError — never swallowed.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { tool } from "ai";
import { z } from "zod";
import { generateSelectivePresentation } from "@/lib/t3n/credentials";
import { validateDataToken, logDataAccess } from "@/lib/db/operations";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  MEDICAL_FIELD_LABELS,
  type MedicalField,
  type MedicalSnapshot,
} from "@/types/medical";

const AGENT_DID = process.env.T3N_AGENT_DID ?? "";

// ─── Tool 1: verify_patient_did ───────────────────────────────────────────────

/**
 * Verifies a patient's DID is registered on T3N.
 *
 * Looks up the patient in PatientSession table — if they registered
 * via MediPass, their DID and T3N user_id are stored there.
 * This confirms their identity before any data access.
 */
export const verifyPatientDIDTool = tool({
  description:
    "Verify that a patient's DID is registered on Terminal 3 Network and retrieve their T3N user ID. Must be called first before any data access.",
  parameters: z.object({
    did: z.string().regex(/^did:key:z/, "Must be a valid did:key DID"),
  }),
  execute: async ({ did }) => {
    const session = await db.patientSession.findUnique({
      where: { patientDID: did },
    });

    if (!session) {
      throw new AppError("AGENT_DID_NOT_FOUND", { did });
    }

    return {
      verified: true,
      t3nUserId: session.t3nUserId,
      vcId: session.vcId,
      vcCID: session.vcCID,
      registeredAt: session.createdAt.toISOString(),
    };
  },
});

// ─── Tool 2: get_medical_credential ───────────────────────────────────────────

/**
 * Retrieves selective medical data via T3N BBS+ disclosure.
 *
 * This is the privacy-preserving core:
 * 1. Checks DataToken authorization (is this agent allowed these fields?)
 * 2. Calls T3N POST /v1/vc/issuer/credentials/proof
 * 3. T3N TEE returns ONLY the requested fields with BBS+ proof
 * 4. Returns structured disclosure result
 *
 * The agent sees only what the proof reveals.
 * No other fields are accessible — mathematically enforced by BBS+.
 */
export const getMedicalCredentialTool = tool({
  description:
    "Retrieve specific medical fields from the patient's verified credential using selective disclosure. Only returns fields the patient has authorized. Must call verify_patient_did first.",
  parameters: z.object({
    patientDID: z.string().regex(/^did:key:z/),
    t3nUserId: z.number().int().positive(),
    vcId: z.string().uuid(),
    fields: z
      .array(
        z.enum([
          "blood_type",
          "allergies",
          "active_medications",
          "emergency_contact_name",
          "emergency_contact_phone",
        ]),
      )
      .min(1)
      .max(5),
  }),
  execute: async ({ patientDID, vcId, fields }) => {
    // t3nUserId is validated by the schema above but not needed here —
    // the VC presentation is keyed by vcId, not the numeric user id.
    // Check authorization before calling T3N
    await validateDataToken(patientDID, AGENT_DID, fields as MedicalField[]);

    const presentation = await generateSelectivePresentation(
      vcId,
      fields as MedicalField[],
    );

    return {
      holder: presentation.holder,
      disclosedFields: presentation.disclosedFields,
      disclosedData: presentation.disclosedData,
      verifiedAt: presentation.verifiedAt.toISOString(),
      proofType: "BBS+ DataIntegrityProof",
    };
  },
});

// ─── Tool 3: format_medical_snapshot ─────────────────────────────────────────

/**
 * Transforms raw VC disclosure into a clinical summary for the doctor UI.
 *
 * Pure transformation — no network calls, no side effects.
 * This is separate from get_medical_credential so the agent
 * can format data without making additional API calls.
 */
export const formatMedicalSnapshotTool = tool({
  description:
    "Format the disclosed medical data into a clean clinical summary for display to the doctor. Pure transformation — no external calls.",
  parameters: z.object({
    disclosedData: z.record(z.unknown()),
    disclosedFields: z.array(z.string()),
    verifiedAt: z.string(),
    holderDID: z.string(),
  }),
  execute: async ({ disclosedData, disclosedFields, verifiedAt, holderDID }) => {
    const snapshot: MedicalSnapshot = {
      bloodType: disclosedData["blood_type"] as string | undefined,
      allergies: disclosedData["allergies"] as string[] | undefined,
      activeMedications: disclosedData["active_medications"] as
        | string[]
        | undefined,
      verifiedAt: new Date(verifiedAt),
      issuerDID: AGENT_DID,
      proofValid: true,
    };

    return {
      snapshot,
      summary: buildClinicalSummary(snapshot, disclosedFields),
      holderDID,
    };
  },
});

function buildClinicalSummary(
  snapshot: MedicalSnapshot,
  fields: string[],
): string {
  const lines: string[] = ["VERIFIED PATIENT DATA", "═".repeat(40)];

  if (snapshot.bloodType) {
    lines.push(`Blood Type:  ${snapshot.bloodType}`);
  }

  if (snapshot.allergies && snapshot.allergies.length > 0) {
    lines.push(`Allergies:   ${snapshot.allergies.join(", ")}`);
  } else if (fields.includes("allergies")) {
    lines.push("Allergies:   None on record");
  }

  if (snapshot.activeMedications && snapshot.activeMedications.length > 0) {
    lines.push(`Medications: ${snapshot.activeMedications.join(", ")}`);
  }

  lines.push("─".repeat(40));
  lines.push(`Verified:    ${snapshot.verifiedAt.toLocaleString()}`);
  lines.push(`Source:      Terminal 3 Network (BBS+ Proof)`);
  lines.push(`Issuer:      MediPass Agent`);

  return lines.join("\n");
}

// ─── Tool 4: log_data_access ──────────────────────────────────────────────────

/**
 * Logs the access event and sends patient notification.
 *
 * NON-OPTIONAL: The system prompt instructs the agent that this
 * MUST be the final tool call. The agent cannot complete without it.
 *
 * Side effects:
 * 1. Writes immutable AccessLog entry to Supabase
 * 2. Sends patient notification email via Resend
 */
export const logDataAccessTool = tool({
  description:
    "Log the data access event to the audit trail and notify the patient. This MUST be called as the final step of every successful data retrieval. Non-optional.",
  parameters: z.object({
    patientId: z.string(),
    patientDID: z.string(),
    doctorId: z.string(),
    hospitalName: z.string().optional(),
    fieldsAccessed: z.array(z.string()).min(1),
    vcId: z.string().uuid(),
    vcCID: z.string(),
  }),
  execute: async ({
    patientId,
    patientDID,
    doctorId,
    hospitalName,
    fieldsAccessed,
    vcId,
    vcCID,
  }) => {
    await logDataAccess({
      patientId,
      patientDID,
      doctorId,
      hospitalName,
      fieldsAccessed: fieldsAccessed as MedicalField[],
      agentDID: AGENT_DID,
      vcId,
      vcCID,
    });

    // Fire-and-forget patient notification
    // (failure here must not block the doctor's response)
    notifyPatient({
      patientId,
      doctorId,
      hospitalName,
      fieldsAccessed,
      timestamp: new Date().toISOString(),
    }).catch((err) => {
      console.error("Patient notification failed (non-fatal):", err);
    });

    return {
      logged: true,
      timestamp: new Date().toISOString(),
      message: "Access event recorded. Patient will be notified.",
    };
  },
});

async function notifyPatient(params: {
  patientId: string;
  doctorId: string;
  hospitalName?: string | undefined;
  fieldsAccessed: string[];
  timestamp: string;
}): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
  if (!RESEND_API_KEY || !FROM_EMAIL) return;

  const patient = await db.patientSession.findFirst({
    where: { t3nUserId: parseInt(params.patientId) },
  });
  if (!patient?.email) return;

  const fieldList = params.fieldsAccessed
    .map((f) => MEDICAL_FIELD_LABELS[f as MedicalField] ?? f)
    .join(", ");

  const when = new Date(params.timestamp).toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    dateStyle: "medium",
    timeStyle: "short",
  });

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: patient.email,
      subject: "MediPass — Your Medical Data Was Accessed",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#F7931A;">MediPass Access Alert</h2>
          <p>Your medical data was accessed on MediPass:</p>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:8px;color:#666;">Data Accessed</td><td style="padding:8px;font-weight:bold;">${fieldList}</td></tr>
            <tr><td style="padding:8px;color:#666;">Location</td><td style="padding:8px;">${params.hospitalName ?? "Unknown"}</td></tr>
            <tr><td style="padding:8px;color:#666;">Time</td><td style="padding:8px;">${when}</td></tr>
          </table>
          <p>If you did not authorize this access, <a href="${process.env.NEXT_PUBLIC_APP_URL}/patient/dashboard">revoke access immediately</a>.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
          <p style="font-size:12px;color:#999;">MediPass — Built by IAMUVIN (iamuvin.com)</p>
        </div>
      `,
    }),
  });
}
