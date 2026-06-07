/**
 * MediPass — Login
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Sandbox build: identity is device-local (created at setup). This page routes
 * existing patients to their dashboard. Production wires NextAuth here.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import Link from "next/link";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-[#F7931A]">
        ← MediPass
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-neutral-600">
        Your medical identity lives on this device and in Terminal 3 Network.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/patient/dashboard"
          className="rounded-md bg-[#F7931A] px-5 py-3 text-center font-semibold text-black hover:bg-[#c9740a]"
        >
          Go to my dashboard
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-neutral-300 px-5 py-3 text-center font-semibold hover:border-[#F7931A]"
        >
          I&apos;m new — create an identity
        </Link>
      </div>

      <OwnershipFooter />
    </main>
  );
}
