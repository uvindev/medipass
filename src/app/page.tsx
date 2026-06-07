/**
 * MediPass — Landing Page
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";
import { Badge } from "@/components/ui/Badge";

const PROOFS = [
  { k: "did:t3n", v: "Verifiable identity" },
  { k: "BBS+", v: "Selective disclosure" },
  { k: "Delegation", v: "Agent acts for you" },
  { k: "Claude", v: "4-tool agent" },
];

const FLOW = [
  {
    title: "Store once",
    body: "Create a did:t3n and seal a BBS+ medical credential into Terminal 3's TEE-encrypted storage. One profile, valid anywhere.",
    icon: <path d="M12 3l8 4v5c0 4.4-3 7.7-8 9-5-1.3-8-4.6-8-9V7l8-4z" />,
  },
  {
    title: "Delegate & retrieve",
    body: "A clinician's Claude agent acts under your scoped, revocable delegation — retrieving only the fields you authorized, never the full record.",
    icon: <path d="M21 21l-4.3-4.3M16 10.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />,
  },
  {
    title: "Notified & audited",
    body: "You get a real-time alert; every access is written to an append-only, cryptographic audit trail. Revoke in one tap.",
    icon: (
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.7 21a2 2 0 01-3.4 0" />
    ),
  },
];

const FEATURES = [
  {
    title: "Selective disclosure",
    body: "BBS+ proofs reveal exactly the requested fields. The agent is mathematically unable to see the rest.",
    icon: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 9a3 3 0 100 6 3 3 0 000-6z" />,
  },
  {
    title: "Patient-held delegation",
    body: "Authorization is a real Terminal 3 delegation credential you grant — scoped to specific fields, time-boxed, and revocable.",
    icon: <path d="M21 10.5V7a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h7M16 19l2 2 4-4" />,
  },
  {
    title: "Instant revocation",
    body: "Pull access from your dashboard. The agent is blocked on its very next attempt — enforced before any data leaves the TEE.",
    icon: <path d="M18.4 5.6a9 9 0 11-12.8 0M12 2v8" />,
  },
  {
    title: "Append-only audit",
    body: "Every disclosure is logged immutably — who, what fields, when, and where. Your record of every access, forever.",
    icon: <path d="M9 12l2 2 4-4M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />,
  },
  {
    title: "Real-time notifications",
    body: "The moment your data is accessed, you know — out-of-band, so you can revoke if something looks wrong.",
    icon: <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.7 21a2 2 0 01-3.4 0" />,
  },
  {
    title: "Cross-border by design",
    body: "A did:t3n is portable across any hospital, any country. Carry your records through any border — safely.",
    icon: <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />,
  },
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
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-green-400" />
              Live on Terminal 3 testnet
            </Badge>
            <Badge tone="dark">Agent Dev Kit Bounty</Badge>
          </div>

          <h1 className="animate-in mt-7 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Your medical identity,
            <br />
            retrieved by an agent —{" "}
            <span className="text-gradient">never held in the open.</span>
          </h1>

          <p className="animate-in mt-6 max-w-xl text-lg leading-relaxed text-white/65">
            MediPass lets a clinician&apos;s AI agent act under your revocable
            delegation — disclosing only the fields you authorize, cryptographically
            proven, fully audited. The agent never sees what it wasn&apos;t granted.
          </p>

          <div className="animate-in mt-9 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-[#F7931A] px-6 py-3 font-semibold text-black shadow-lg shadow-orange-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffb454]"
            >
              Create your identity
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
            >
              I&apos;m a clinician →
            </Link>
          </div>

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

      {/* Problem */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="reveal mx-auto max-w-4xl px-6 py-20 text-center">
          <Badge tone="brand">The problem</Badge>
          <p className="mx-auto mt-5 max-w-3xl text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
            A traveler collapses in a foreign ER. The doctor needs their{" "}
            <span className="text-[#F7931A]">blood type and allergies now</span>{" "}
            — not their whole history, and the patient can&apos;t consent.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-neutral-600">
            Today that means faxes, language barriers, and a brutal choice:
            over-share everything, or get nothing. MediPass makes it
            field-by-field, consented, and revocable — in seconds.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="reveal max-w-2xl">
          <Badge tone="neutral">How it works</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            One profile. Disclosed field-by-field, only with your consent.
          </h2>
        </div>
        <div className="stagger mt-12 grid gap-6 md:grid-cols-3">
          {FLOW.map((f, i) => (
            <div key={f.title} className="card p-6">
              <div className="flex items-center gap-3">
                <Icon>{f.icon}</Icon>
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

      {/* Features */}
      <section className="border-y border-neutral-200 bg-[#fbfbfa]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="reveal max-w-2xl">
            <Badge tone="brand">Capabilities</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Privacy by construction, not by policy.
            </h2>
          </div>
          <div className="stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <Icon>{f.icon}</Icon>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy proof */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="reveal grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <Badge tone="success">Mathematically enforced</Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              The agent is{" "}
              <span className="text-[#F7931A]">structurally unable</span> to see
              what it didn&apos;t ask for.
            </h2>
            <p className="mt-4 text-neutral-600">
              A request for{" "}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm">
                blood_type
              </code>{" "}
              and{" "}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm">
                allergies
              </code>{" "}
              returns exactly those. Medications, conditions, emergency contacts —
              the other 11 fields — never leave the TEE boundary. Patient-held
              delegation gates every access and revokes instantly.
            </p>
          </div>

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
              <span className="text-white/40">{"// requested by clinician"}</span>
              {"\n"}
              <span className="text-[#FFB454]">disclosed</span>
              {": {\n"}
              {'  "blood_type": '}
              <span className="text-green-400">&quot;O+&quot;</span>,{"\n"}
              {'  "allergies": '}
              <span className="text-green-400">[&quot;Penicillin&quot;]</span>
              {"\n}\n\n"}
              <span className="text-white/40">{"// withheld by proof"}</span>
              {"\n"}
              <span className="text-red-300/80">chronic_conditions</span>{" "}
              <span className="text-white/40">✗</span>
              {"\n"}
              <span className="text-red-300/80">active_medications</span>{" "}
              <span className="text-white/40">✗</span>
              {"\n"}
              <span className="text-red-300/80">emergency_contact</span>{" "}
              <span className="text-white/40">✗</span>
            </pre>
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="stagger mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-2">
          <Audience
            tag="For patients"
            title="Own your medical identity"
            points={[
              "13-field profile — blood type, allergies, medications, conditions, injuries, language, and more",
              "Grant clinicians scoped, time-boxed access — revoke any time",
              "Real-time alerts + a full access history",
              "Emergency QR that carries your DID, never your data",
            ]}
            cta={{ href: "/register", label: "Create your identity" }}
          />
          <Audience
            tag="For clinicians"
            title="Verified data, zero liability"
            points={[
              "Doctors, nurses, paramedics, pharmacists — and medical students",
              "Add your specialty + multiple hospital affiliations",
              "An agent retrieves only authorized fields — you never touch raw credentials",
              "Every access is logged and attributed to you",
            ]}
            cta={{ href: "/login", label: "Open the clinician portal" }}
          />
        </div>
      </section>

      {/* Built on Terminal 3 */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="reveal relative mx-auto max-w-6xl px-6 py-24">
          <Badge tone="dark">Built on Terminal 3 Network</Badge>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Real verifiable identity + Agent Auth, live on testnet.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["did:t3n", "SIWE handshake mints a verifiable, on-network identity for patients and the agent."],
              ["BBS+ credentials", "W3C 2.0 medical credentials, signed and selectively disclosable inside the TEE."],
              ["Delegation", "The agent acts under a real Terminal 3 delegation credential — scoped and revocable."],
              ["Claude agent", "A deterministic 4-tool chain (temperature 0) drives every retrieval."],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="font-mono text-sm font-semibold text-[#FFB454]">
                  {k}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="reveal relative overflow-hidden rounded-3xl bg-ink px-6 py-20 text-center text-white">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="glow-brand absolute inset-x-0 top-0 h-80" />
          <div className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#F7931A]/25 blur-[120px]" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#4A9EFF]/15 blur-[120px]" />

          <div className="relative">
            <span className="pill bg-white/10 text-white ring-1 ring-white/15">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-green-400" />
              Free · open beta on Terminal 3 testnet
            </span>
            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Carry your records across any border —{" "}
              <span className="text-gradient">safely.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/60">
              Create your medical identity in under a minute. Disclosed only with
              your consent. Revocable any time.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-[#F7931A] px-7 py-3.5 font-semibold text-black shadow-lg shadow-orange-500/30 transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffb454]"
              >
                Get started — free
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <OwnershipFooter />
      </section>
    </main>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
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
        {children}
      </svg>
    </span>
  );
}

function Audience({
  tag,
  title,
  points,
  cta,
}: {
  tag: string;
  title: string;
  points: string[];
  cta: { href: string; label: string };
}) {
  return (
    <div className="card p-8">
      <Badge tone="brand">{tag}</Badge>
      <h3 className="mt-4 text-xl font-bold tracking-tight">{title}</h3>
      <ul className="mt-5 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex gap-3 text-sm text-neutral-600">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-[#F7931A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {p}
          </li>
        ))}
      </ul>
      <Link
        href={cta.href}
        className="mt-6 inline-block rounded-lg bg-[#F7931A] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#ffb454]"
      >
        {cta.label}
      </Link>
    </div>
  );
}
