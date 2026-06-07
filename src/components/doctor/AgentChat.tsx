/**
 * MediPass — Doctor Agent Chat UI
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Drives MediAgent via the Vercel AI SDK useChat hook. The agent runs its
 * strict four-tool chain server-side; tool progress and the final snapshot
 * stream back as assistant text.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

interface AgentChatProps {
  initialPatientDID?: string;
}

export function AgentChat({ initialPatientDID }: AgentChatProps) {
  const [patientDID, setPatientDID] = useState(initialPatientDID ?? "");
  const [hospital, setHospital] = useState("");

  const { messages, isLoading, append } = useChat({
    api: "/api/agent",
    maxSteps: 10,
    onError: (err) => {
      console.error("Agent error:", err);
    },
  });

  function handleLookup() {
    if (!patientDID.startsWith("did:t3n:")) {
      alert("Invalid DID format. Must start with did:t3n:");
      return;
    }
    const location = hospital.trim() ? ` Hospital: ${hospital.trim()}.` : "";
    void append({
      role: "user",
      content: `Patient has arrived. DID: ${patientDID}.${location} Please retrieve blood type and allergies.`,
    });
  }

  const started = messages.length > 0 || isLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_170px]">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-neutral-300">
            did:t3n:
          </span>
          <input
            type="text"
            value={patientDID}
            onChange={(e) => setPatientDID(e.target.value)}
            placeholder="did:t3n:a5d990be…"
            className="w-full rounded-lg border border-neutral-300 py-2.5 pl-[68px] pr-3 font-mono text-sm outline-none transition focus:border-[#F7931A] focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <input
          type="text"
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
          placeholder="Hospital (optional)"
          className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#F7931A] focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <button
        onClick={handleLookup}
        disabled={isLoading || !patientDID}
        className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#F7931A] px-5 py-2.5 font-semibold text-black transition hover:bg-[#ffb454] disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Spinner /> Retrieving…
          </>
        ) : (
          <>Retrieve patient data</>
        )}
      </button>

      {/* Console output */}
      <div
        data-testid="agent-console"
        className="min-h-[220px] rounded-xl bg-[#0c0e13] p-4"
      >
        {!started ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
            <span className="font-mono text-xs text-white/30">
              awaiting patient DID
            </span>
            <span className="font-mono text-[11px] text-white/20 cursor-blink" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`animate-in rounded-lg px-3.5 py-2.5 text-sm ${
                  m.role === "assistant"
                    ? "bg-white/5 font-mono text-green-300"
                    : "bg-white/10 text-white/80"
                }`}
              >
                {m.role === "user" && (
                  <span className="mr-2 font-mono text-[10px] uppercase tracking-wide text-[#FFB454]">
                    doctor
                  </span>
                )}
                <pre className="inline whitespace-pre-wrap break-words font-sans">
                  {m.content}
                </pre>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 px-1 font-mono text-xs text-white/40">
                <Spinner />
                MediAgent processing
                <span className="cursor-blink" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
      />
    </svg>
  );
}
