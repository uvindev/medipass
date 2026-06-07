/**
 * MediPass — Patient Setup Page
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { SiteHeader } from "@/components/shared/SiteHeader";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";
import { Badge } from "@/components/ui/Badge";
import { MedicalProfileForm } from "@/components/patient/MedicalProfileForm";

export default function PatientSetupPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfa]">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Badge tone="brand">Patient onboarding</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Create your medical identity
        </h1>
        <p className="mt-2 text-neutral-600">
          Entered once. A real <span className="font-mono text-sm">did:t3n</span>{" "}
          is minted and your profile is sealed into Terminal 3 — disclosed
          field-by-field, only with your authorization.
        </p>

        <div className="card mt-8 p-6 sm:p-8">
          <MedicalProfileForm />
        </div>

        <OwnershipFooter />
      </div>
    </main>
  );
}
