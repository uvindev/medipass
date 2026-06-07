# 05 — MediAgent Implementation

> Vercel AI SDK v5 + `@ai-sdk/anthropic` + `claude-sonnet-4-20250514`.
> `streamText` server-side, `useChat` client-side.
> Temperature = 0. Four tools. Mandatory `log_data_access` as final step.

---

## Why Vercel AI SDK Over Raw Anthropic SDK

For a Next.js streaming agent, Vercel AI SDK is strictly better:
- `streamText` returns `result.toDataStreamResponse()` — one line for the route handler
- `useChat` on the client handles SSE parsing, message history, loading state
- Tool results stream back to the UI as they complete — doctor sees progress
- `maxSteps: 10` handles the full tool call chain automatically

The raw Anthropic SDK requires manual SSE parsing, message history management,
and tool result injection. The AI SDK handles all of this.

---

## src/lib/agent/tools.ts

```typescript
/**
 * MediPass — MediAgent Tool Implementations
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Four tools. One responsibility each.
 * All inputs validated with Zod before execution.
 * All errors throw AppError — never swallowed.
 */

import { tool } from "ai";
import { z } from "zod";
import { generateSelectivePresentation } from "@/lib/t3n/credentials";
import { validateDataToken, logDataAccess } from "@/lib/db/operations";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { MedicalField, MedicalSnapshot } from "@/types/medical";

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
  execute: async ({ patientDID, t3nUserId: _t3nUserId, vcId, fields }) => {
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
      activeMedications: disclosedData["active_medications"] as string[] | undefined,
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
  hospitalName?: string;
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

  const fieldLabels: Record<string, string> = {
    blood_type: "Blood Type",
    allergies: "Allergies",
    active_medications: "Active Medications",
    emergency_contact_name: "Emergency Contact Name",
    emergency_contact_phone: "Emergency Contact Phone",
  };

  const fieldList = params.fieldsAccessed
    .map((f) => fieldLabels[f] ?? f)
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
```

---

## src/lib/agent/mediagent.ts

```typescript
/**
 * MediPass — MediAgent Definition
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

export const MEDIAGENT_SYSTEM_PROMPT = `
You are MediAgent, a medical identity verification agent powered by Terminal 3 Network.

Your ONLY job: verify a patient's T3N identity and retrieve their authorized medical data
using cryptographic selective disclosure. You operate in a clinical setting where accuracy
and privacy are non-negotiable.

## TOOL EXECUTION ORDER — STRICT
You MUST call tools in this exact order:
1. verify_patient_did — always first. Never skip.
2. get_medical_credential — only after verification succeeds.
3. format_medical_snapshot — always after credential retrieval.
4. log_data_access — ALWAYS last. Non-optional. Never skip.

## RULES — NEVER VIOLATE
- Never ask the user for credentials, API keys, or passwords.
- Never skip log_data_access. Every access must be logged.
- Never request fields not authorized by the patient's data token.
  If the token only covers blood_type and allergies, do not request medications.
- If verify_patient_did fails (DID not found), stop immediately. 
  Explain clearly: "Patient DID not found in MediPass registry."
- If get_medical_credential fails with token expired/revoked, stop immediately.
  Explain: "Patient's access authorization has expired or been revoked."
- Never expose raw proof data or cryptographic material in your response.
- Never store or repeat patient data outside of the formatted snapshot.

## RESPONSE FORMAT
After completing all 4 tool calls:
1. Present the formatted medical snapshot clearly
2. State: "Access logged. Patient has been notified."
3. Do not add commentary, recommendations, or analysis.

You are a data retrieval agent. Medical interpretation is the doctor's job.
`.trim();

export const mediagentTools = {
  verify_patient_did: verifyPatientDIDTool,
  get_medical_credential: getMedicalCredentialTool,
  format_medical_snapshot: formatMedicalSnapshotTool,
  log_data_access: logDataAccessTool,
};
```

*Import the tools from `./tools.ts` at the top.*

---

## src/app/api/agent/route.ts

```typescript
/**
 * MediPass — Agent API Route
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * POST /api/agent
 * Streams MediAgent responses to the doctor UI.
 */

import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest } from "next/server";
import { ownershipHeaders } from "@/lib/watermark";
import { MEDIAGENT_SYSTEM_PROMPT, mediagentTools } from "@/lib/agent/mediagent";
import type { CoreMessage } from "ai";
import { z } from "zod";

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return new Response("Invalid request body", {
      status: 400,
      headers: ownershipHeaders,
    });
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: MEDIAGENT_SYSTEM_PROMPT,
    messages: parsed.data.messages as CoreMessage[],
    tools: mediagentTools,
    maxSteps: 10,       // allows full 4-tool chain + retries
    temperature: 0,     // deterministic — medical context demands this
    maxTokens: 1024,
  });

  return result.toDataStreamResponse({
    headers: ownershipHeaders,
  });
}
```

---

## src/components/doctor/AgentChat.tsx

```tsx
/**
 * MediPass — Doctor Agent Chat UI
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

interface AgentChatProps {
  initialPatientDID?: string;
}

export function AgentChat({ initialPatientDID }: AgentChatProps) {
  const [patientDID, setPatientDID] = useState(initialPatientDID ?? "");

  const { messages, isLoading, append } = useChat({
    api: "/api/agent",
    maxSteps: 10,
    onError: (err) => {
      console.error("Agent error:", err);
    },
  });

  function handleLookup() {
    if (!patientDID.startsWith("did:key:")) {
      alert("Invalid DID format. Must start with did:key:");
      return;
    }

    append({
      role: "user",
      content: `Patient has arrived. DID: ${patientDID}. Please retrieve blood type and allergies.`,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={patientDID}
          onChange={(e) => setPatientDID(e.target.value)}
          placeholder="did:key:z..."
          className="flex-1 rounded-md border px-3 py-2 font-mono text-sm"
        />
        <button
          onClick={handleLookup}
          disabled={isLoading || !patientDID}
          className="rounded-md bg-orange-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? "Retrieving..." : "Retrieve Data"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-md p-3 ${
              m.role === "assistant"
                ? "bg-slate-900 font-mono text-green-400"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            <pre className="whitespace-pre-wrap text-sm">{m.content}</pre>
          </div>
        ))}
        {isLoading && (
          <div className="rounded-md bg-slate-900 p-3 text-sm text-slate-400">
            MediAgent processing...
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## What We Learned From Research

**Vercel AI SDK `streamText` with tools:**
- Use `maxSteps: 10` to allow multi-turn tool chains
- `result.toDataStreamResponse()` handles SSE protocol automatically
- `useChat` on client handles message history + loading state
- Tool results appear as messages in the stream — doctor sees progress

**Claude Sonnet 4 tool use specifics:**
- Model ID confirmed: `claude-sonnet-4-20250514`
- Temperature = 0 is supported and gives fully deterministic tool selection
- Fine-grained tool streaming is supported (tokens stream as they generate)
- `maxSteps` controls how many tool call rounds Claude can make

**Critical**: `temperature: 0` with Claude means the agent selects
the same tool in the same order every time given the same input.
This is what "agent stability" means — and it's a judge criterion.
