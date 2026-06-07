/**
 * MediPass — Doctor Patient Lookup
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Frames the agent interaction: the strict four-tool chain alongside the
 * AgentChat console that drives MediAgent.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { AgentChat } from "./AgentChat";

const STEPS = [
  {
    name: "verify_patient_did",
    desc: "Confirm the DID is registered on Terminal 3.",
  },
  {
    name: "get_medical_credential",
    desc: "BBS+ selective disclosure of authorized fields only.",
  },
  {
    name: "format_medical_snapshot",
    desc: "Render a clean clinical summary.",
  },
  {
    name: "log_data_access",
    desc: "Append-only audit entry + patient notification.",
  },
];

export function PatientLookup() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Console */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-neutral-100 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <span className="ml-2 font-mono text-xs text-neutral-400">
            mediagent — session
          </span>
        </div>
        <div className="p-5">
          <AgentChat />
        </div>
      </div>

      {/* Tool chain */}
      <aside className="card h-fit p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Agent tool chain
        </h3>
        <p className="mt-1 text-xs text-neutral-400">
          Strict order, enforced by the system prompt.
        </p>
        <ol className="mt-4 space-y-4">
          {STEPS.map((s, i) => (
            <li key={s.name} className="relative flex gap-3">
              {i < STEPS.length - 1 && (
                <span className="absolute left-[11px] top-7 h-[calc(100%-4px)] w-px bg-neutral-200" />
              )}
              <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-[#F7931A]">
                {i + 1}
              </span>
              <div className="-mt-0.5">
                <div className="font-mono text-[13px] font-medium text-neutral-800">
                  {s.name}
                </div>
                <div className="mt-0.5 text-xs leading-snug text-neutral-500">
                  {s.desc}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
