/**
 * MediPass — Animated Agent Tool Chain
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Loops through the agent's strict 4-tool chain so the agentic flow lands at a
 * glance: verify -> disclose -> format -> log.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

const STEPS = [
  {
    name: "verify_patient_did",
    title: "Verify identity",
    body: "Resolve the patient's did:t3n on Terminal 3.",
  },
  {
    name: "get_medical_credential",
    title: "Selective disclosure",
    body: "BBS+ proof reveals only the authorized fields.",
  },
  {
    name: "format_medical_snapshot",
    title: "Clinical summary",
    body: "Shape the disclosed data for the clinician.",
  },
  {
    name: "log_data_access",
    title: "Audit + notify",
    body: "Append-only log; the patient is alerted.",
  },
];

export function AgentFlow() {
  const [step, setStep] = useState(0); // 0..3 active, 4 = all complete

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 5), 1500);
    return () => clearInterval(id);
  }, []);

  const statusOf = (i: number): "done" | "active" | "pending" => {
    if (step === 4 || i < step) return "done";
    if (i === step) return "active";
    return "pending";
  };
  const progress = (step / 4) * 100;

  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#08090d] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F7931A]/40 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F7931A]/[0.07] blur-[150px]" />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <Badge tone="dark">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-green-400" />
            Inside the agent
          </Badge>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            A deterministic chain — every retrieval, the same four steps.
          </h2>
          <p className="mt-3 text-white/55">
            Claude (temperature 0) runs a strict tool order enforced by the system
            prompt. No improvisation, no skipped audit.
          </p>
        </div>

        {/* progress rail */}
        <div className="relative mt-12">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-white/10 md:block" />
          <div
            className="absolute left-0 top-5 hidden h-px bg-[#F7931A] transition-all duration-700 ease-out md:block"
            style={{ width: `${progress}%` }}
          />

          <ol className="grid gap-6 md:grid-cols-4">
            {STEPS.map((s, i) => {
              const status = statusOf(i);
              return (
                <li key={s.name} className="relative">
                  <span
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-all duration-500 ${
                      status === "done"
                        ? "border-green-400/40 bg-green-400/15 text-green-300"
                        : status === "active"
                          ? "border-[#F7931A] bg-[#F7931A] text-black shadow-[0_0_20px_4px_rgba(247,147,26,0.5)]"
                          : "border-white/15 bg-white/5 text-white/40"
                    }`}
                  >
                    {status === "done" ? (
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : status === "active" ? (
                      <Spinner />
                    ) : (
                      i + 1
                    )}
                  </span>

                  <div
                    className={`mt-4 transition-opacity duration-500 ${
                      status === "pending" ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <div className="font-mono text-[12px] text-[#FFB454]">
                      {s.name}
                    </div>
                    <div className="mt-1 font-semibold">{s.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">
                      {s.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-30"
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M12 3a9 9 0 019 9h-3a6 6 0 00-6-6V3z"
      />
    </svg>
  );
}
