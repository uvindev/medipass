/**
 * MediPass — Doctor Patient Lookup
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Frames the agent interaction: explains the four-tool flow, then hands off
 * to AgentChat which drives the MediAgent.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { AgentChat } from "./AgentChat";

const STEPS = [
  "verify_patient_did",
  "get_medical_credential",
  "format_medical_snapshot",
  "log_data_access",
];

export function PatientLookup() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Agent tool chain (strict order)
        </p>
        <ol className="mt-2 flex flex-wrap gap-2 text-xs">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="rounded bg-white px-2 py-1 font-mono text-neutral-700 ring-1 ring-neutral-200"
            >
              {i + 1}. {s}
            </li>
          ))}
        </ol>
      </div>

      <AgentChat />
    </div>
  );
}
