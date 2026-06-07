/**
 * MediPass — Patient Dashboard
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Reads the patient identity from localStorage (set at setup), loads tokens +
 * access logs, and renders revocation controls.
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
  vcCID: string;
  email: string;
}

interface DashboardData {
  tokens: TokenEntry[];
  logs: AccessLogEntry[];
}

export default function PatientDashboardPage() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (patientId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patient?patientId=${patientId}`);
      if (res.ok) {
        const body = (await res.json()) as { data: DashboardData };
        setData(body.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem("medipass.identity");
    if (!raw) {
      setLoading(false);
      return;
    }
    const parsed = JSON.parse(raw) as Identity;
    setIdentity(parsed);
    void load(String(parsed.t3nUserId));
  }, [load]);

  if (!loading && !identity) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">No identity on this device</h1>
        <p className="mt-2 text-neutral-600">
          Set up your medical profile first.
        </p>
        <Link
          href="/patient/setup"
          className="mt-6 inline-block rounded-md bg-[#F7931A] px-5 py-2 font-semibold text-black"
        >
          Set up profile
        </Link>
      </main>
    );
  }

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
        <Link
          href="/patient/qr"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-[#F7931A]"
        >
          Emergency QR
        </Link>
      </div>

      {identity && (
        <p className="mt-3 inline-block break-all rounded-lg bg-white px-3 py-1.5 font-mono text-xs text-neutral-500 ring-1 ring-neutral-200">
          {identity.did}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Authorizations</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Control which fields the MediAgent may disclose. Revoke any time —
          revocation takes effect on the agent&apos;s next attempt.
        </p>
        <div className="mt-4">
          {identity && data && (
            <TokenManager
              patientId={String(identity.t3nUserId)}
              patientDID={identity.did}
              tokens={data.tokens}
              onChange={() => void load(String(identity.t3nUserId))}
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
          {loading && <p className="text-sm text-neutral-500">Loading…</p>}
          {data && <AccessLog entries={data.logs} />}
        </div>
      </section>

      <OwnershipFooter />
      </div>
    </main>
  );
}
