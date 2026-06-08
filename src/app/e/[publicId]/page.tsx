/**
 * MediPass — Public Emergency Card
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Public page reached by scanning a patient's emergency QR. Shows only the
 * minimal, patient-chosen fields a first responder needs.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { emergencyFromCredential } from "@/lib/emergency";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Emergency Medical Info — MediPass",
  robots: { index: false },
};

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const session = await db.patientSession.findUnique({ where: { publicId } });
  if (!session) notFound();

  const info = emergencyFromCredential(session.credential, session.fullName);
  const telHref = info.contactPhone
    ? `tel:${info.contactPhone.replace(/[^+\d]/g, "")}`
    : undefined;

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          {/* Emergency header */}
          <div className="flex items-center gap-2 bg-red-600 px-5 py-3 text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 2h2v7h7v2h-7v7h-2v-7H4V9h7V2z" />
            </svg>
            <span className="font-bold tracking-wide">EMERGENCY MEDICAL INFO</span>
          </div>

          <div className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Patient
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {info.fullName}
            </div>

            <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl bg-red-50 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-600 text-2xl font-extrabold text-white">
                {info.bloodType}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
                  Blood group
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Allergies
                </div>
                <div className="text-sm font-medium text-neutral-900">
                  {info.allergies.length ? info.allergies.join(", ") : "None on record"}
                </div>
              </div>
            </div>

            {info.contactName || telHref ? (
              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Emergency contact
                </div>
                <div className="mt-1 font-semibold text-neutral-900">
                  {info.contactName || "—"}
                </div>
                {telHref && (
                  <a
                    href={telHref}
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11 11 0 003.5.56 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.56 3.5 1 1 0 01-.24 1l-2.22 2.3z" />
                    </svg>
                    Call {info.contactPhone}
                  </a>
                )}
              </div>
            ) : null}

            <p className="mt-6 border-t border-neutral-100 pt-4 text-xs leading-relaxed text-neutral-400">
              Verified on Terminal 3 Network. This is the patient&apos;s chosen
              emergency information only — the full record requires their
              authorization.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-neutral-400">
          <Link href="/" className="opacity-70 transition hover:opacity-100">
            <Logo size={22} />
          </Link>
        </div>
      </div>
    </main>
  );
}
