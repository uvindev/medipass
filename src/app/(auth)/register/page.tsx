/**
 * MediPass — Register
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { Suspense } from "react";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";
import { Badge } from "@/components/ui/Badge";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfa]">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-12">
        <Badge tone="brand">Create your account</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Join MediPass
        </h1>
        <p className="mt-2 text-neutral-600">
          Patients carry their identity; clinicians retrieve it. Pick your role.
        </p>

        <div className="card mt-8 p-6 sm:p-8">
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>

        <OwnershipFooter />
      </div>
    </main>
  );
}
