/**
 * MediPass — FAQ
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is my medical data on a blockchain?",
    a: "No. Your did:t3n identity is registered on the Terminal 3 network, but your actual medical data is sealed as a BBS+ credential inside Terminal 3's TEE-encrypted storage — never on a public ledger, never in plaintext, never held by MediPass.",
  },
  {
    q: "What does the doctor actually see?",
    a: "Only the fields you authorized — by default, blood type and allergies. A BBS+ proof discloses exactly those and the cryptography makes everything else (medications, conditions, contacts) unreadable to the agent. The doctor never receives your full record.",
  },
  {
    q: "Can I revoke access?",
    a: "Yes, instantly. Revoke an authorization from your dashboard and the agent is blocked on its very next attempt — the check happens before any data leaves the enclave. You also get a real-time notification every time your data is accessed.",
  },
  {
    q: "How is the agent allowed to act on my behalf?",
    a: "Through a Terminal 3 delegation credential you grant — scoped to specific fields, time-boxed, and revocable. The agent signs an invocation proving it acts under your delegation. It can never request a field you didn't authorize.",
  },
  {
    q: "Who can register?",
    a: "Patients, and clinicians of every kind — doctors, nurses, paramedics, pharmacists, and medical students. Clinicians add their specialty and hospital affiliations; patients build a portable medical identity.",
  },
  {
    q: "Is this production-ready with real patient data?",
    a: "MediPass runs live on the Terminal 3 testnet as an Agent Dev Kit demonstration. The architecture is real and verified end-to-end, but please don't store real medical records during the evaluation period.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-y border-neutral-200 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="reveal text-center">
          <Badge tone="brand">FAQ</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Questions, answered.
          </h2>
        </div>

        <div className="stagger mt-10 space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-[#fbfbfa]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-neutral-900">
                    {item.q}
                  </span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-[#F7931A] transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[15px] leading-relaxed text-neutral-600">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
