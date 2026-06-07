/**
 * MediPass — Badge / Pill
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import type { ReactNode } from "react";

type Tone = "brand" | "neutral" | "success" | "dark";

const TONES: Record<Tone, string> = {
  brand: "bg-orange-100 text-orange-800",
  neutral: "bg-neutral-100 text-neutral-700",
  success: "bg-green-100 text-green-800",
  dark: "bg-white/10 text-white ring-1 ring-white/15",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={`pill ${TONES[tone]} ${className}`}>{children}</span>;
}
