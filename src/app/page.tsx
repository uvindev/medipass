/**
 * MediPass — Landing Page
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import Link from "next/link";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";
import { Badge } from "@/components/ui/Badge";

const FLOW = [
  {
    title: "Store once",
    body: "The patient mints a did:t3n and stores a BBS+ medical credential in Terminal 3's TEE-encrypted storage. One time, anywhere.",
    icon: (
      <path d="M12 3l8 4v5c0 4.4-3 7.7-8 9-5-1.3-8-4.6-8-9V7l8-4z" />
    ),
  },
  {
    title: "Agent retrieves",
    body: "A Claude agent at any hospital requests only the fields the doctor is authorized for — blood type, allergies — via selective disclosure.",
    icon: (
      <path d="M21 21l-4.3-4.3M16 10.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />
    ),
  },
  {
    title: "Patient notified",
    body: "The patient gets a real-time alert. The access event is logged to an append-only audit trail. The agent never holds the full credential.",
    icon: (
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.7 21a2 2 0 01-3.4 0" />
    ),
  },
];

const PROOFS = [
  { k: "did:t3n", v: "Live identity" },
  { k: "BBS+", v: "Selective disclosure" },
  { k: "TEE", v: "Encrypted storage" },
  { k: "Claude", v: "4-tool agent" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-grid opacity-70" />
        <div className="glow-brand absolute inset-x-0 top-0 h-[520px]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
          <div className="animate-in flex flex-wrap items-center gap-2">
            <Badge tone="dark">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F7931A]" />
              Terminal 3 Agent Dev Kit
            </Badge>
            <Badge tone="dark">Cross-border medical identity</Badge>
          </div>

          <h1 className="animate-in mt-7 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Your medical identity,
            <br />
            retrieved by an agent —{" "}
            <span className="text-gradient">never held in the open.</span>
          </h1>

          <p className="animate-in mt-6 max-w-xl text-lg leading-relaxed text-white/65">
            The doctor&apos;s agent sees only the fields it&apos;s authorized to
            see. The proof is mathematical, not procedural — powered by Terminal
            3 selective disclosure.
          </p>

          <div className="animate-in mt-9 flex flex-wrap gap-3">
            <Link
              href="/patient/setup"
              className="rounded-xl bg-[#F7931A] px-6 py-3 font-semibold text-black shadow-lg shadow-orange-500/20 transition hover:bg-[#ffb454]"
            >
              Set up your profile
            </Link>
            <Link
              href="/doctor"
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Open doctor portal →
            </Link>
          </div>

          {/* proof strip */}
          <div className="animate-in mt-16 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {PROOFS.map((p) => (
              <div key={p.k} className="bg-ink px-4 py-4">
                <div className="font-mono text-sm font-semibold text-[#FFB454]">
                  {p.k}
                </div>
                <div className="mt-0.5 text-xs text-white/50">{p.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <Badge tone="brand">How it works</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            One profile. Disclosed field-by-field, only with consent.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FLOW.map((f, i) => (
            <div key={f.title} className="card relative p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-[#F7931A]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {f.icon}
                  </svg>
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy statement band */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <Badge tone="success">Privacy by construction</Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              The agent is{" "}
              <span className="text-[#F7931A]">structurally unable</span> to see
              what it didn&apos;t ask for.
            </h2>
            <p className="mt-4 text-neutral-600">
              Selective disclosure means a request for{" "}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm">
                blood_type
              </code>{" "}
              and{" "}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm">
                allergies
              </code>{" "}
              returns exactly those — never medications, never emergency
              contacts. Patient-held tokens gate every access and revoke
              instantly.
            </p>
          </div>

          {/* Disclosure mock */}
          <div className="card-dark overflow-hidden p-5 font-mono text-sm text-white/90">
            <div className="flex items-center gap-1.5 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              <span className="ml-2 text-xs text-white/40">
                selective_disclosure.json
              </span>
            </div>
            <pre className="leading-relaxed">
              <span className="text-white/40">{"// requested by doctor"}</span>
              {"\n"}
              <span className="text-[#FFB454]">disclosed</span>
              {": {\n"}
              {'  "blood_type": '}
              <span className="text-green-400">&quot;O+&quot;</span>,{"\n"}
              {'  "allergies": '}
              <span className="text-green-400">
                [&quot;Penicillin&quot;]
              </span>
              {"\n}\n\n"}
              <span className="text-white/40">{"// withheld by proof"}</span>
              {"\n"}
              <span className="text-red-300/80">
                active_medications
              </span>{" "}
              <span className="text-white/40">✗ not disclosed</span>
              {"\n"}
              <span className="text-red-300/80">emergency_contact</span>{" "}
              <span className="text-white/40">✗ not disclosed</span>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Carry your records across any border — safely.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/patient/setup"
            className="rounded-xl bg-[#F7931A] px-6 py-3 font-semibold text-black transition hover:bg-[#ffb454]"
          >
            Create your identity
          </Link>
          <Link
            href="/doctor"
            className="rounded-xl border border-neutral-300 px-6 py-3 font-semibold transition hover:border-[#F7931A]"
          >
            I&apos;m a clinician
          </Link>
        </div>
        <OwnershipFooter />
      </section>
    </main>
  );
}
