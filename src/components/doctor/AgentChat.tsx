/**
 * MediPass — Doctor Agent Chat UI
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Drives the MediAgent via the Vercel AI SDK useChat hook. The agent runs
 * its strict four-tool chain server-side; tool progress and the final
 * snapshot stream back as assistant text.
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

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
        <input
          type="text"
          value={patientDID}
          onChange={(e) => setPatientDID(e.target.value)}
          placeholder="did:t3n:..."
          className="rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm"
        />
        <input
          type="text"
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
          placeholder="Hospital (optional)"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={handleLookup}
        disabled={isLoading || !patientDID}
        className="self-start rounded-md bg-[#F7931A] px-5 py-2 font-semibold text-black transition hover:bg-[#c9740a] disabled:opacity-50"
      >
        {isLoading ? "Retrieving…" : "Retrieve patient data"}
      </button>

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
            MediAgent processing…
          </div>
        )}
      </div>
    </div>
  );
}
