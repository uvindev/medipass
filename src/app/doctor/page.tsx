/**
 * MediPass — Doctor Portal
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { SiteHeader } from "@/components/shared/SiteHeader";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";
import { Badge } from "@/components/ui/Badge";
import { PatientLookup } from "@/components/doctor/PatientLookup";
import { getSessionUser } from "@/lib/auth";

export default async function DoctorPage() {
  const clinician = await getSessionUser();
  const profileBits = [
    clinician?.clinicianType,
    clinician?.specialty,
    clinician?.hospitals?.join(", ") || clinician?.hospital,
    clinician?.country,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#fbfbfa]">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge tone="brand">Clinician console</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Retrieve verified patient data
            </h1>
            {clinician && (
              <p className="mt-2 text-sm font-medium text-neutral-700">
                {clinician.name}
                {profileBits.length > 0 && (
                  <span className="text-neutral-400">
                    {" "}
                    · {profileBits.join(" · ")}
                  </span>
                )}
              </p>
            )}
            <p className="mt-2 max-w-xl text-neutral-600">
              Enter a patient&apos;s DID. MediAgent verifies it on Terminal 3,
              discloses only authorized fields, and logs the access — you never
              touch raw credentials.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm">
            <span className="live-dot h-2 w-2 rounded-full bg-green-500" />
            <span className="font-medium text-neutral-700">testnet</span>
            <span className="text-neutral-300">·</span>
            <span className="font-mono text-xs text-neutral-500">did:t3n</span>
          </div>
        </div>

        <div className="mt-8">
          <PatientLookup />
        </div>

        <OwnershipFooter />
      </div>
    </main>
  );
}
