/**
 * MediPass — Site Header
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function SiteHeader({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur ${
        dark
          ? "border-b border-white/10 bg-ink/70 text-white"
          : "border-b border-neutral-200/70 bg-[#fbfbfa]/80"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="transition hover:opacity-80">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/patient/setup"
            className={`rounded-lg px-3 py-1.5 transition ${
              dark ? "hover:bg-white/10" : "hover:bg-neutral-100"
            }`}
          >
            Patient
          </Link>
          <Link
            href="/doctor"
            className="rounded-lg bg-[#F7931A] px-3.5 py-1.5 font-semibold text-black transition hover:bg-[#ffb454]"
          >
            Doctor portal
          </Link>
        </nav>
      </div>
    </header>
  );
}
