/**
 * MediPass — Register Form
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Email + password sign-up via Supabase Auth, with role (patient/doctor) stored
 * in user metadata. On success (no email confirmation required) the session is
 * live and we route to the role's home.
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

const schema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  hospital: z.string().max(120).optional(),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("patient");
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            role,
            name: values.name,
            ...(role === "doctor" && values.hospital
              ? { hospital: values.hospital }
              : {}),
          },
        },
      });

      if (error) {
        setServerError(error.message);
        return;
      }
      // Email confirmation enabled → no session yet.
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Role toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-1">
        {(["patient", "doctor"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-lg py-2 text-sm font-semibold capitalize transition ${
              role === r
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

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

      {role === "doctor" && (
        <Field
          label="Hospital (optional)"
          htmlFor="hospital"
          error={errors.hospital?.message}
        >
          <input
            id="hospital"
            {...register("hospital")}
            className="auth-input"
            placeholder="Mount Elizabeth"
          />
        </Field>
      )}

      {serverError && <p className="text-sm text-red-700">{serverError}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#F7931A] px-6 py-3 font-semibold text-black transition hover:bg-[#ffb454] disabled:opacity-50"
      >
        {pending ? "Creating account…" : `Create ${role} account`}
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
