/**
 * MediPass — Emergency QR Page
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Renders a scannable QR of the patient's DID. A first responder scans it,
 * the doctor portal resolves it, and the agent discloses only authorized
 * fields. The QR carries the DID — never the medical data itself.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";

interface Identity {
  did: string;
  t3nUserId: number;
}

export default function PatientQRPage() {
  const [did, setDid] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("medipass.identity");
    if (!raw) return;
    const parsed = JSON.parse(raw) as Identity;
    setDid(parsed.did);

    void QRCode.toDataURL(parsed.did, {
      width: 320,
      margin: 2,
      color: { dark: "#0A0A0A", light: "#FFFFFF" },
    }).then(setDataUrl);
  }, []);

  return (
    <main className="mx-auto max-w-xl px-6 py-12 text-center">
      <Link
        href="/patient/dashboard"
        className="text-sm text-neutral-500 hover:text-[#F7931A]"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Emergency QR</h1>
      <p className="mt-2 text-neutral-600">
        Show this to a clinician. It encodes your DID only — no medical data
        travels in the code.
      </p>

      <div className="mt-8 flex flex-col items-center">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="Patient DID QR code"
            className="rounded-lg border border-neutral-200"
            width={320}
            height={320}
          />
        ) : (
          <p className="text-sm text-neutral-500">
            {did === null
              ? "No identity on this device. Set up your profile first."
              : "Generating QR…"}
          </p>
        )}
        {did && (
          <p className="mt-4 break-all font-mono text-xs text-neutral-500">
            {did}
          </p>
        )}
      </div>

      <OwnershipFooter />
    </main>
  );
}
