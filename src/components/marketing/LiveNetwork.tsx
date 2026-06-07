/**
 * MediPass — Live Network Activity
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * A world map of pulsing nodes + a streaming activity feed + live counters.
 * Events are a synthetic visualization of network activity on the Terminal 3
 * testnet — privacy-safe (event type + city only, never patient data).
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Globe3D } from "./Globe3D";

// Approx equirectangular positions (x%, y%) so the dots read as a world map.
const CITIES = [
  { city: "San Francisco", cc: "US", x: 12, y: 40 },
  { city: "New York", cc: "US", x: 25, y: 37 },
  { city: "Toronto", cc: "CA", x: 24, y: 33 },
  { city: "Mexico City", cc: "MX", x: 18, y: 51 },
  { city: "São Paulo", cc: "BR", x: 32, y: 71 },
  { city: "London", cc: "GB", x: 46, y: 29 },
  { city: "Paris", cc: "FR", x: 48, y: 31 },
  { city: "Berlin", cc: "DE", x: 51, y: 28 },
  { city: "Lagos", cc: "NG", x: 49, y: 55 },
  { city: "Cairo", cc: "EG", x: 55, y: 43 },
  { city: "Dubai", cc: "AE", x: 60, y: 46 },
  { city: "Mumbai", cc: "IN", x: 66, y: 49 },
  { city: "Singapore", cc: "SG", x: 75, y: 59 },
  { city: "Seoul", cc: "KR", x: 82, y: 37 },
  { city: "Tokyo", cc: "JP", x: 85, y: 39 },
  { city: "Sydney", cc: "AU", x: 89, y: 78 },
];

type Kind = "mint" | "disclose" | "delegate" | "revoke" | "verify";

const EVENTS: { kind: Kind; label: string; color: string; bump: "id" | "disc" | "rev" | null }[] = [
  { kind: "mint", label: "Identity minted", color: "#F7931A", bump: "id" },
  { kind: "disclose", label: "Blood type disclosed", color: "#22c55e", bump: "disc" },
  { kind: "disclose", label: "Allergies disclosed", color: "#22c55e", bump: "disc" },
  { kind: "delegate", label: "Delegation granted", color: "#4A9EFF", bump: null },
  { kind: "verify", label: "DID verified", color: "#a78bfa", bump: null },
  { kind: "revoke", label: "Access revoked", color: "#ef4444", bump: "rev" },
];

interface Activity {
  id: number;
  label: string;
  color: string;
  city: string;
  cc: string;
  at: number;
}

const rng = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

function ago(ms: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 1) return "now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export function LiveNetwork() {
  const [feed, setFeed] = useState<Activity[]>([]);
  const [counts, setCounts] = useState({ disc: 8421, id: 3187, rev: 642, cc: 41 });
  const [, force] = useState(0);
  const nextId = useRef(1);

  useEffect(() => {
    function tick() {
      const ev = rng(EVENTS);
      const loc = rng(CITIES);
      const item: Activity = {
        id: nextId.current++,
        label: ev.label,
        color: ev.color,
        city: loc.city,
        cc: loc.cc,
        at: Date.now(),
      };
      setFeed((f) => [item, ...f].slice(0, 9));
      setCounts((c) => ({
        disc: c.disc + (ev.bump === "disc" ? 1 : Math.random() < 0.4 ? 1 : 0),
        id: c.id + (ev.bump === "id" ? 1 : 0),
        rev: c.rev + (ev.bump === "rev" ? 1 : 0),
        cc: c.cc,
      }));
    }

    // Seed the feed full immediately so the panel never looks empty.
    setFeed(
      Array.from({ length: 8 }, (_, i) => {
        const ev = rng(EVENTS);
        const loc = rng(CITIES);
        return {
          id: nextId.current++,
          label: ev.label,
          color: ev.color,
          city: loc.city,
          cc: loc.cc,
          at: Date.now() - (i + 1) * 2300,
        };
      }),
    );
    const a = setInterval(tick, 2200);
    const b = setInterval(() => force((n) => n + 1), 1000); // refresh "Xs ago"
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="glow-brand absolute inset-x-0 top-0 h-80" />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="pill bg-white/10 text-white ring-1 ring-white/15">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-green-400" />
              Live · Terminal 3 testnet
            </span>
            <h2 className="mt-5 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              A trust network coming alive, worldwide.
            </h2>
          </div>
          {/* Counters */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            <Stat label="Disclosures" value={counts.disc} />
            <Stat label="Identities" value={counts.id} />
            <Stat label="Revocations" value={counts.rev} />
            <Stat label="Countries" value={counts.cc} />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* 3D network globe — rotating, with arcs flying city-to-city */}
          <div className="h-[340px] sm:h-[460px]">
            <Globe3D />
          </div>

          {/* Activity feed */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
              <span>live activity</span>
              <span className="flex items-center gap-1.5">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-green-400" />
                live
              </span>
            </div>
            <ul className="flex-1 space-y-0.5">
              {feed.map((e) => (
                <li
                  key={e.id}
                  className="animate-in flex items-center gap-3 rounded-lg px-2 py-[7px] text-sm transition-colors hover:bg-white/5"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: e.color, boxShadow: `0 0 8px ${e.color}` }}
                  />
                  <span className="min-w-0 flex-1 truncate text-white/85">
                    {e.label}
                    <span className="text-white/40"> · {e.city}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-white/35">
                    {ago(e.at)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2 border-t border-white/5 px-2 pt-3 font-mono text-[10px] uppercase tracking-widest text-white/30">
              <span className="h-1 w-1 animate-pulse rounded-full bg-[#F7931A]" />
              streaming · global testnet nodes
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-white/30">
          Illustrative network activity on the T3N testnet. No patient data is
          shown — only event types and locations.
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-mono text-2xl font-bold tabular-nums text-[#FFB454]">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-white/45">{label}</div>
    </div>
  );
}
