/**
 * MediPass — Patient Setup Page
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import Link from "next/link";
import { MedicalProfileForm } from "@/components/patient/MedicalProfileForm";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";

export default function PatientSetupPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-neutral-500 hover:text-[#F7931A]">
        ← MediPass
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Create your medical identity
      </h1>
      <p className="mt-2 text-neutral-600">
        Entered once. Stored encrypted in Terminal 3 Network. Disclosed
        field-by-field, only with your authorization.
      </p>

      <div className="mt-8">
        <MedicalProfileForm />
      </div>

      <OwnershipFooter />
    </main>
  );
}
