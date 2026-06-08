/**
 * MediPass — Contact
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Contact — MediPass" };

const CHANNELS = [
  {
    label: "Email",
    value: "uvin95dev@gmail.com",
    href: "mailto:uvin95dev@gmail.com",
    icon: <path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM3.5 6.5l8.5 6 8.5-6" />,
  },
  {
    label: "GitHub",
    value: "github.com/uvindev/medipass",
    href: "https://github.com/uvindev/medipass",
    icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 00-1-2.6c3-.3 6-1.5 6-6.5a5 5 0 00-1.4-3.5 4.7 4.7 0 00-.1-3.5s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 1.7 5.4 2 5.4 2a4.7 4.7 0 00-.1 3.5A5 5 0 004 9c0 5 3 6.2 5.9 6.5a3.4 3.4 0 00-1 2.6V22" />,
  },
  {
    label: "Website",
    value: "iamuvin.com",
    href: "https://iamuvin.com",
    icon: <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />,
  },
  {
    label: "Security",
    value: "Report a vulnerability",
    href: "/security",
    icon: <path d="M12 3l8 4v5c0 4.4-3 7.7-8 9-5-1.3-8-4.6-8-9V7l8-4z" />,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfa]">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Badge tone="brand">Contact</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-3 max-w-xl text-neutral-600">
          Questions about MediPass, the Terminal 3 integration, licensing, or a
          security report? Reach out — built by Uvin Vindula (IAMUVIN), Terra Labz.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((c) => (
            <Channel key={c.label} {...c} />
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function Channel({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
}) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="card flex items-center gap-4 p-5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-[#F7931A]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </span>
        <span className="block truncate font-medium text-neutral-900">
          {value}
        </span>
      </span>
    </a>
  );
}
