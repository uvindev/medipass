/**
 * MediPass — Login
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { Suspense } from "react";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";
import { Badge } from "@/components/ui/Badge";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfa]">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-12">
        <Badge tone="brand">Welcome back</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Sign in to MediPass
        </h1>
        <p className="mt-2 text-neutral-600">
          Access your medical identity or the clinician portal.
        </p>

        <div className="card mt-8 p-6 sm:p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <OwnershipFooter />
      </div>
    </main>
  );
}
