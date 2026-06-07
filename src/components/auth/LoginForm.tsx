/**
 * MediPass — Login Form
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { homeForRole, type Role } from "@/lib/roles";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword(values);

      if (error) {
        setServerError(error.message);
        return;
      }
      const role = data.user?.user_metadata?.["role"] as Role | undefined;
      const next = params.get("next");
      router.replace(next ?? (role ? homeForRole(role) : "/"));
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          {...register("email")}
          type="email"
          className="auth-input"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          {...register("password")}
          type="password"
          className="auth-input"
          placeholder="Your password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-700">{errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-700">{serverError}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#F7931A] px-6 py-3 font-semibold text-black transition hover:bg-[#ffb454] disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        New to MediPass?{" "}
        <Link href="/register" className="font-semibold text-[#F7931A]">
          Create an account
        </Link>
      </p>
    </form>
  );
}
