/**
 * MediPass — Access Log Table
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { MEDICAL_FIELD_LABELS, type MedicalField } from "@/types/medical";

export interface AccessLogEntry {
  id: string;
  doctorId: string;
  hospitalName: string | null;
  fieldsAccessed: string[];
  timestamp: string;
}

function labelField(field: string): string {
  return MEDICAL_FIELD_LABELS[field as MedicalField] ?? field;
}

export function AccessLog({ entries }: { entries: AccessLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
        No access events yet. When a doctor&apos;s agent retrieves your data, it
        appears here.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Fields disclosed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {entries.map((e) => (
            <tr key={e.id}>
              <td className="px-4 py-3 text-neutral-700">
                {new Date(e.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-neutral-700">
                {e.hospitalName ?? "Unknown"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {e.fieldsAccessed.map((f) => (
                    <span
                      key={f}
                      className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800"
                    >
                      {labelField(f)}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
