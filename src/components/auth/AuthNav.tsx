/**
 * MediPass — Header Auth Nav
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Reflects the session in the header: signed-out shows Log in / Sign up;
 * signed-in shows the account + a Sign out button. Reacts to auth changes.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { homeForRole, type Role } from "@/lib/roles";

export function AuthNav({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (!ready) return <span className="h-8 w-20" aria-hidden />;

  const hover = dark ? "hover:bg-white/10" : "hover:bg-neutral-100";

  if (!user) {
    return (
      <>
        <Link href="/login" className={`rounded-lg px-3 py-1.5 transition ${hover}`}>
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-[#F7931A] px-3.5 py-1.5 font-semibold text-black transition hover:bg-[#ffb454]"
        >
          Sign up
        </Link>
      </>
    );
  }

  const name =
    (user.user_metadata?.["name"] as string | undefined) ?? user.email;
  const role = user.user_metadata?.["role"] as Role | undefined;

  return (
    <>
      {role && (
        <Link
          href={homeForRole(role)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${hover}`}
        >
          {role === "doctor" ? "Portal" : "Dashboard"}
        </Link>
      )}
      <span
        className={`hidden max-w-[160px] truncate text-sm sm:inline ${
          dark ? "text-white/70" : "text-neutral-500"
        }`}
        title={user.email ?? undefined}
      >
        {name}
      </span>
      <button
        type="button"
        onClick={signOut}
        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
          dark
            ? "border-white/15 hover:bg-white/10"
            : "border-neutral-300 hover:bg-neutral-100"
        }`}
      >
        Sign out
      </button>
    </>
  );
}
