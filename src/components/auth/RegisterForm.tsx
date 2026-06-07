/**
 * MediPass — Register Form
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Email + password sign-up via Supabase Auth, role (patient | doctor) + profile
 * in user metadata. The clinician path captures type (incl. medical student),
 * country, specialty (type-ahead), and multiple hospitals.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { homeForRole, type Role } from "@/lib/roles";
import { CLINICIAN_TYPES, MEDICAL_SPECIALTIES } from "@/lib/clinician";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  country: z.string().max(60).optional(),
  specialty: z.string().max(80).optional(),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("patient");
  const [clinicianType, setClinicianType] = useState<string>(CLINICIAN_TYPES[0]);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [hospitalInput, setHospitalInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function addHospital() {
    const v = hospitalInput.trim();
    if (v && !hospitals.includes(v)) setHospitals([...hospitals, v]);
    setHospitalInput("");
  }

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const supabase = createSupabaseBrowser();
      const meta: Record<string, unknown> = { role, name: values.name };
      if (role === "doctor") {
        meta.clinician_type = clinicianType;
        if (values.country) meta.country = values.country;
        if (values.specialty) meta.specialty = values.specialty;
        if (hospitals.length) {
          meta.hospitals = hospitals;
          meta.hospital = hospitals[0]; // primary, for audit attribution
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: meta },
      });

      if (error) {
        setServerError(error.message);
        return;
      }
      if (!data.session) {
        setConfirmSent(true);
        return;
      }
      router.replace(homeForRole(role));
      router.refresh();
    });
  }

  if (confirmSent) {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 p-6 text-sm text-green-900">
        Check your email to confirm your account, then{" "}
        <Link href="/login" className="font-semibold underline">
          sign in
        </Link>
        .
      </div>
    );
  }

  const isClinician = role === "doctor";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Role toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-1">
        {(
          [
            ["patient", "Patient"],
            ["doctor", "Clinician"],
          ] as [Role, string][]
        ).map(([r, label]) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              role === r
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isClinician && (
        <Field label="I am a" htmlFor="clinician-type">
          <select
            id="clinician-type"
            value={clinicianType}
            onChange={(e) => setClinicianType(e.target.value)}
            className="auth-input"
          >
            {CLINICIAN_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Full name" htmlFor="name" error={errors.name?.message}>
        <input
          id="name"
          {...register("name")}
          className="auth-input"
          placeholder="Uvin Vindula"
        />
      </Field>

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          {...register("email")}
          type="email"
          className="auth-input"
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <input
          id="password"
          {...register("password")}
          type="password"
          className="auth-input"
          placeholder="At least 8 characters"
        />
      </Field>

      {isClinician && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Country" htmlFor="country">
              <input
                id="country"
                {...register("country")}
                className="auth-input"
                placeholder="Singapore"
              />
            </Field>
            <Field label="Specialty" htmlFor="specialty">
              <input
                id="specialty"
                list="specialty-options"
                {...register("specialty")}
                className="auth-input"
                placeholder="Start typing…"
              />
              <datalist id="specialty-options">
                {MEDICAL_SPECIALTIES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
          </div>

          <div>
            <label htmlFor="hospital-input" className="mb-1 block text-sm font-medium">
              Hospitals / affiliations
            </label>
            <div className="flex gap-2">
              <input
                id="hospital-input"
                value={hospitalInput}
                onChange={(e) => setHospitalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHospital();
                  }
                }}
                className="auth-input"
                placeholder="Mount Elizabeth"
              />
              <button
                type="button"
                onClick={addHospital}
                className="shrink-0 rounded-lg border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-100"
              >
                Add
              </button>
            </div>
            {hospitals.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {hospitals.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800"
                  >
                    {h}
                    <button
                      type="button"
                      onClick={() =>
                        setHospitals(hospitals.filter((x) => x !== h))
                      }
                      className="text-orange-600 hover:text-orange-900"
                      aria-label={`Remove ${h}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {serverError && <p className="text-sm text-red-700">{serverError}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#F7931A] px-6 py-3 font-semibold text-black transition hover:bg-[#ffb454] disabled:opacity-50"
      >
        {pending
          ? "Creating account…"
          : `Create ${isClinician ? "clinician" : "patient"} account`}
      </button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#F7931A]">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
