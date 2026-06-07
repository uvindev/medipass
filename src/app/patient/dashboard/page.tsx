/**
 * MediPass — Patient Dashboard
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Gated to the authenticated patient (middleware). Identity + tokens + logs come
 * from the session-keyed /api/patient endpoint.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AccessLog, type AccessLogEntry } from "@/components/patient/AccessLog";
import {
  TokenManager,
  type TokenEntry,
} from "@/components/patient/TokenManager";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";
import { Badge } from "@/components/ui/Badge";

interface Identity {
  did: string;
  t3nUserId: number;
  vcId: string;
}

interface DashboardData {
  identity: Identity | null;
  tokens: TokenEntry[];
  logs: AccessLogEntry[];
}

export default function PatientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patient");
      if (res.ok) {
        const body = (await res.json()) as { data: DashboardData };
        setData(body.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const identity = data?.identity ?? null;

  return (
    <main className="min-h-screen bg-[#fbfbfa]">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Badge tone="brand">Patient dashboard</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Your access control
            </h1>
          </div>
          {identity && (
            <Link
              href="/patient/qr"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-[#F7931A]"
            >
              Emergency QR
            </Link>
          )}
        </div>

        {loading && (
          <p className="mt-8 text-sm text-neutral-500">Loading…</p>
        )}

        {!loading && !identity && (
          <div className="card mt-8 p-8 text-center">
            <h2 className="text-lg font-semibold">No medical identity yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600">
              Set up your profile once — we mint your did:t3n and seal a BBS+
              credential into Terminal 3.
            </p>
            <Link
              href="/patient/setup"
              className="mt-6 inline-block rounded-lg bg-[#F7931A] px-5 py-2.5 font-semibold text-black transition hover:bg-[#ffb454]"
            >
              Set up your profile
            </Link>
          </div>
        )}

        {identity && (
          <>
            <p className="mt-3 inline-block break-all rounded-lg bg-white px-3 py-1.5 font-mono text-xs text-neutral-500 ring-1 ring-neutral-200">
              {identity.did}
            </p>

            <section className="mt-10">
              <h2 className="text-lg font-semibold">Authorizations</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Control which fields the MediAgent may disclose. Revoke any time —
                it takes effect on the agent&apos;s next attempt.
              </p>
              <div className="mt-4">
                {data && (
                  <TokenManager
                    patientId={String(identity.t3nUserId)}
                    patientDID={identity.did}
                    tokens={data.tokens}
                    onChange={() => void load()}
                  />
                )}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-lg font-semibold">Access history</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Every disclosure, append-only and timestamped.
              </p>
              <div className="mt-4">
                {data && <AccessLog entries={data.logs} />}
              </div>
            </section>
          </>
        )}

        <OwnershipFooter />
      </div>
    </main>
  );
}
