/**
 * MediPass — Landing Page
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import Link from "next/link";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";

const FLOW = [
  {
    step: "1",
    title: "Store once",
    body: "Patient saves their medical profile into Terminal 3 Network's TEE-encrypted decentralized storage. One time.",
  },
  {
    step: "2",
    title: "Agent retrieves",
    body: "A Claude agent at any hospital requests only the fields the doctor asked for — blood type, allergies — via BBS+ selective disclosure.",
  },
  {
    step: "3",
    title: "Patient notified",
    body: "The patient gets a real-time alert. The access event is cryptographically logged to an append-only audit trail.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded bg-[#F7931A] px-2 py-1 text-sm font-bold text-black">
            MediPass
          </span>
          <span className="text-sm text-neutral-500">on Terminal 3 Network</span>
        </div>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/patient/setup" className="hover:text-[#F7931A]">
            Patient
          </Link>
          <Link href="/doctor" className="hover:text-[#F7931A]">
            Doctor
          </Link>
        </nav>
      </header>

      <section className="mt-20">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Your medical identity, retrieved by an agent —{" "}
          <span className="text-[#F7931A]">never held in the open.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-600">
          A cross-border medical identity agent. The doctor&apos;s agent sees
          only the fields it&apos;s authorized to see. The proof is
          mathematical, not procedural.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/patient/setup"
            className="rounded-md bg-[#F7931A] px-6 py-3 font-semibold text-black transition hover:bg-[#c9740a]"
          >
            Set up your profile
          </Link>
          <Link
            href="/doctor"
            className="rounded-md border border-neutral-300 px-6 py-3 font-semibold transition hover:border-[#F7931A]"
          >
            Open doctor portal
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-8 sm:grid-cols-3">
        {FLOW.map((f) => (
          <div
            key={f.step}
            className="rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7931A] font-bold text-black">
              {f.step}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{f.body}</p>
          </div>
        ))}
      </section>

      <OwnershipFooter />
    </main>
  );
}
