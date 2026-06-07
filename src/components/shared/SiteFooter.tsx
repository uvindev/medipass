/**
 * MediPass — Site Footer (landing)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

const REPO = "https://github.com/uvindev/medipass";

type LinkDef = [label: string, href: string];

const COLUMNS: { title: string; links: LinkDef[] }[] = [
  {
    title: "Product",
    links: [
      ["Create identity", "/register"],
      ["Sign in", "/login"],
      ["Doctor portal", "/doctor"],
      ["Patient dashboard", "/patient/dashboard"],
    ],
  },
  {
    title: "Network",
    links: [
      ["Terminal 3", "https://www.terminal3.io"],
      ["Agent Dev Kit", "https://docs.terminal3.io"],
      ["GitHub", REPO],
    ],
  },
  {
    title: "Legal",
    links: [
      ["License", `${REPO}/blob/main/LICENSE`],
      ["Security", `${REPO}/blob/main/SECURITY.md`],
      ["Contact", "mailto:uvin95dev@gmail.com"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#08090d] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F7931A]/40 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 rounded-full bg-[#F7931A]/[0.06] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Logo size={30} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              Cross-border medical identity agent on Terminal 3 Network.
              Disclosed only with your consent — revocable, audited, private.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-green-400" />
              Live on Terminal 3 testnet
            </div>
            <div className="mt-5 flex gap-2">
              <Social href={REPO} label="GitHub">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 015 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0022 12.25C22 6.58 17.52 2 12 2z" />
                </svg>
              </Social>
              <Social href="https://iamuvin.com" label="Website">
                <Stroke d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
              </Social>
              <Social href="mailto:uvin95dev@gmail.com" label="Email">
                <Stroke d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM3.5 6.5l8.5 6 8.5-6" />
              </Social>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <FooterLink href={href}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© 2026 Uvin Vindula (IAMUVIN). All Rights Reserved. Proprietary.</p>
          <p>
            Built by{" "}
            <a
              href="https://iamuvin.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#F7931A] hover:underline"
            >
              Uvin Vindula — IAMUVIN
            </a>{" "}
            · Terra Labz · inSITE Campus
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  const cls = "text-sm text-white/55 transition hover:text-white";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:border-[#F7931A]/40 hover:text-[#F7931A]"
    >
      {children}
    </a>
  );
}

function Stroke({ d }: { d: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
