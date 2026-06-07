/**
 * MediPass — Data Token Manager
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Lists a patient's authorization tokens and lets them issue or revoke.
 * Revocation blocks the agent on its next attempt (validateDataToken).
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useState } from "react";
import {
  MEDICAL_FIELDS,
  MEDICAL_FIELD_LABELS,
  type MedicalField,
} from "@/types/medical";

export interface TokenEntry {
  id: string;
  fields: string[];
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
}

interface TokenManagerProps {
  patientId: string;
  patientDID: string;
  tokens: TokenEntry[];
  onChange: () => void;
}

export function TokenManager({
  patientId,
  patientDID,
  tokens,
  onChange,
}: TokenManagerProps) {
  const [selected, setSelected] = useState<MedicalField[]>([
    "blood_type",
    "allergies",
  ]);
  const [duration, setDuration] = useState(24);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(field: MedicalField) {
    setSelected((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field],
    );
  }

  async function issue() {
    if (selected.length === 0) {
      setError("Select at least one field");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientDID,
          fields: selected,
          durationHours: duration,
        }),
      });
      if (!res.ok) throw new Error(`Issue failed (${res.status})`);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Issue failed");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(tokenId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/token", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, patientId }),
      });
      if (!res.ok) throw new Error(`Revoke failed (${res.status})`);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 p-5">
        <h3 className="text-sm font-semibold">Grant a new authorization</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {MEDICAL_FIELDS.map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => toggle(field)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                selected.includes(field)
                  ? "border-[#F7931A] bg-orange-50 text-orange-800"
                  : "border-neutral-300 text-neutral-600"
              }`}
            >
              {MEDICAL_FIELD_LABELS[field]}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              Duration (hours)
            </label>
            <input
              type="number"
              min={1}
              max={168}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-28 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={issue}
            disabled={busy}
            className="rounded-md bg-[#F7931A] px-4 py-2 text-sm font-semibold text-black hover:bg-[#c9740a] disabled:opacity-50"
          >
            Issue token
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </div>

      <div className="space-y-3">
        {tokens.length === 0 && (
          <p className="text-sm text-neutral-500">No tokens issued yet.</p>
        )}
        {tokens.map((t) => {
          const expired = new Date(t.expiresAt).getTime() < Date.now();
          const active = !t.revoked && !expired;
          return (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3"
            >
              <div>
                <div className="flex flex-wrap gap-1">
                  {t.fields.map((f) => (
                    <span
                      key={f}
                      className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700"
                    >
                      {MEDICAL_FIELD_LABELS[f as MedicalField] ?? f}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Expires {new Date(t.expiresAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold ${
                    active
                      ? "text-green-700"
                      : t.revoked
                        ? "text-red-700"
                        : "text-neutral-400"
                  }`}
                >
                  {active ? "Active" : t.revoked ? "Revoked" : "Expired"}
                </span>
                {active && (
                  <button
                    type="button"
                    onClick={() => revoke(t.id)}
                    disabled={busy}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
