/**
 * MediPass — Register
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Routes to the one-time medical profile setup, which provisions the T3N
 * identity, DID, and BBS+ credential.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import Link from "next/link";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-[#F7931A]">
        ← MediPass
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Create your identity
      </h1>
      <p className="mt-2 text-neutral-600">
        One intake form provisions a Terminal 3 user, a did:key DID, and a
        BBS+-signed medical credential.
      </p>

      <Link
        href="/patient/setup"
        className="mt-8 inline-block rounded-md bg-[#F7931A] px-5 py-3 font-semibold text-black hover:bg-[#c9740a]"
      >
        Start setup
      </Link>

      <OwnershipFooter />
    </main>
  );
}
