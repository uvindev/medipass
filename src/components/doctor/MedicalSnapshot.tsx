/**
 * MediPass — Medical Snapshot Card
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Presentational card for a verified, selectively-disclosed snapshot.
 * Rendered when the doctor UI receives structured disclosure data.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import type { MedicalSnapshot as Snapshot } from "@/types/medical";

export function MedicalSnapshot({ snapshot }: { snapshot: Snapshot }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Verified patient data
        </h3>
        {snapshot.proofValid && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            BBS+ verified
          </span>
        )}
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        {snapshot.bloodType && (
          <Row label="Blood type" value={snapshot.bloodType} />
        )}
        {snapshot.allergies && (
          <Row
            label="Allergies"
            value={
              snapshot.allergies.length > 0
                ? snapshot.allergies.join(", ")
                : "None on record"
            }
          />
        )}
        {snapshot.activeMedications &&
          snapshot.activeMedications.length > 0 && (
            <Row
              label="Medications"
              value={snapshot.activeMedications.join(", ")}
            />
          )}
      </dl>

      <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        Verified {snapshot.verifiedAt.toLocaleString()} · Source: Terminal 3
        Network
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-900">{value}</dd>
    </div>
  );
}
