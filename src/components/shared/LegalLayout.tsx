/**
 * MediPass — Legal Page Layout
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { Badge } from "@/components/ui/Badge";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#fbfbfa]">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-14">
        <Badge tone="brand">Legal</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated {updated}</p>
        <div className="legal-prose mt-8">{children}</div>
      </article>
      <SiteFooter />
    </main>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-neutral-900">{heading}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-neutral-600">
        {children}
      </div>
    </section>
  );
}
