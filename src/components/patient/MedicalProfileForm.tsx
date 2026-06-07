/**
 * MediPass — Medical Profile Setup Form
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * One-time intake. POSTs to /api/t3n/user which creates the T3N user,
 * mints the did:t3n, issues the BBS+ MedicalIdentityVC, and creates a
 * default DataToken. The returned DID + private key are shown once for the
 * patient to save.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useState } from "react";

interface SetupResult {
  did: string;
  privateKeyHex: string;
  t3nUserId: number;
  vcId: string;
  vcCID: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function MedicalProfileForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bloodType, setBloodType] = useState("O+");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SetupResult | null>(null);

  function splitList(value: string): string[] {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/t3n/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          bloodType,
          allergies: splitList(allergies),
          activeMedications: splitList(medications),
          emergencyContactName: contactName,
          emergencyContactPhone: contactPhone,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data = (await res.json()) as SetupResult;
      setResult(data);

      // Persist non-secret identity so the dashboard/QR pages can resolve it.
      // The private key is NOT stored automatically — the patient saves it.
      window.localStorage.setItem(
        "medipass.identity",
        JSON.stringify({
          did: data.did,
          t3nUserId: data.t3nUserId,
          vcId: data.vcId,
          vcCID: data.vcCID,
          email,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-6">
        <h2 className="text-lg font-semibold text-green-900">
          Identity created on Terminal 3 Network
        </h2>
        <p className="mt-1 text-sm text-green-800">
          Your medical credential is stored, BBS+-signed, and pinned to IPFS.
          Save the values below — the private key is shown only once.
        </p>

        <dl className="mt-4 space-y-3 text-sm">
          <Field label="Your DID" value={result.did} mono />
          <Field
            label="Private Key (SAVE THIS — shown once)"
            value={result.privateKeyHex}
            mono
            danger
          />
          <Field label="T3N User ID" value={String(result.t3nUserId)} />
          <Field label="VC ID" value={result.vcId} mono />
          <Field label="IPFS CID" value={result.vcCID} mono />
        </dl>

        <a
          href="/patient/dashboard"
          className="mt-6 inline-block rounded-md bg-[#F7931A] px-5 py-2 font-semibold text-black hover:bg-[#c9740a]"
        >
          Go to dashboard
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" value={firstName} onChange={setFirstName} required />
        <Input label="Last name" value={lastName} onChange={setLastName} required />
      </div>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />

      <div>
        <label htmlFor="blood-type" className="mb-1 block text-sm font-medium">
          Blood type
        </label>
        <select
          id="blood-type"
          value={bloodType}
          onChange={(e) => setBloodType(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none transition focus:border-[#F7931A] focus:ring-2 focus:ring-orange-200"
        >
          {BLOOD_TYPES.map((bt) => (
            <option key={bt} value={bt}>
              {bt}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Allergies (comma-separated)"
        value={allergies}
        onChange={setAllergies}
        placeholder="Penicillin, Latex"
      />
      <Input
        label="Active medications (comma-separated)"
        value={medications}
        onChange={setMedications}
        placeholder="Metformin 500mg"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Emergency contact name"
          value={contactName}
          onChange={setContactName}
          required
        />
        <Input
          label="Emergency contact phone"
          value={contactPhone}
          onChange={setContactPhone}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[#F7931A] px-6 py-3 font-semibold text-black transition hover:bg-[#c9740a] disabled:opacity-50"
      >
        {submitting ? "Creating identity on T3N…" : "Create medical identity"}
      </button>
    </form>
  );
}

function fieldId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Input(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const id = fieldId(props.label);
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {props.label}
      </label>
      <input
        id={id}
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder ?? ""}
        required={props.required ?? false}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none transition focus:border-[#F7931A] focus:ring-2 focus:ring-orange-200"
      />
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  mono?: boolean;
  danger?: boolean;
}) {
  return (
    <div>
      <dt
        className={`text-xs uppercase tracking-wide ${
          props.danger ? "text-red-700" : "text-neutral-500"
        }`}
      >
        {props.label}
      </dt>
      <dd
        className={`mt-1 break-all rounded bg-white px-2 py-1 text-sm ${
          props.mono ? "font-mono" : ""
        } ${props.danger ? "border border-red-300" : "border border-neutral-200"}`}
      >
        {props.value}
      </dd>
    </div>
  );
}
