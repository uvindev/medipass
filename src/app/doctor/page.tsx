/**
 * MediPass — Doctor Portal
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import Link from "next/link";
import { PatientLookup } from "@/components/doctor/PatientLookup";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";

export default function DoctorPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-neutral-500 hover:text-[#F7931A]">
        ← MediPass
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Doctor portal</h1>
      <p className="mt-2 text-neutral-600">
        Enter a patient&apos;s DID. The MediAgent verifies it on Terminal 3
        Network, retrieves only authorized fields via BBS+ selective
        disclosure, and logs the access. You never touch raw credentials.
      </p>

      <div className="mt-8">
        <PatientLookup />
      </div>

      <OwnershipFooter />
    </main>
  );
}
