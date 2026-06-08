/**
 * MediPass — 3D Network Globe
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * A rotating dark globe with glowing city nodes and animated arcs ("data" flying
 * city-to-city). Hardened for mobile: the heavy WebGL bundle only initializes
 * once the section scrolls into view, the renderer pixel-ratio is capped (so a
 * retina phone doesn't render a 1400px² canvas and hang), the load is lightened
 * on small screens / reduced-motion, a branded loader covers the gap until the
 * globe is ready, and a CSS-sphere fallback renders if WebGL is unavailable.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { GlobeMethods } from "react-globe.gl";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopo from "world-atlas/countries-110m.json";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const CITIES = [
  { city: "San Francisco", lat: 37.77, lng: -122.42 },
  { city: "New York", lat: 40.71, lng: -74.01 },
  { city: "Toronto", lat: 43.65, lng: -79.38 },
  { city: "Mexico City", lat: 19.43, lng: -99.13 },
  { city: "São Paulo", lat: -23.55, lng: -46.63 },
  { city: "London", lat: 51.51, lng: -0.13 },
  { city: "Paris", lat: 48.86, lng: 2.35 },
  { city: "Berlin", lat: 52.52, lng: 13.4 },
  { city: "Lagos", lat: 6.52, lng: 3.38 },
  { city: "Cairo", lat: 30.04, lng: 31.24 },
  { city: "Dubai", lat: 25.2, lng: 55.27 },
  { city: "Mumbai", lat: 19.08, lng: 72.88 },
  { city: "Singapore", lat: 1.35, lng: 103.82 },
  { city: "Seoul", lat: 37.57, lng: 126.98 },
  { city: "Tokyo", lat: 35.68, lng: 139.69 },
  { city: "Sydney", lat: -33.87, lng: 151.21 },
];

interface Arc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

function randomArcs(n: number): Arc[] {
  const arcs: Arc[] = [];
  for (let i = 0; i < n; i++) {
    const a = CITIES[Math.floor(Math.random() * CITIES.length)]!;
    let b = CITIES[Math.floor(Math.random() * CITIES.length)]!;
    if (a === b) b = CITIES[(CITIES.indexOf(a) + 3) % CITIES.length]!;
    arcs.push({ startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng });
  }
  return arcs;
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function Globe3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [arcs, setArcs] = useState<Arc[]>([]);

  // Staged loading: inView gates the WebGL bundle; ready hides the loader;
  // webgl=false falls back to a static CSS sphere.
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);
  // lite = small screen or reduced-motion → fewer dots/arcs, no rings, capped DPR.
  const [lite, setLite] = useState(false);
  const [reduce, setReduce] = useState(false);

  const globeMaterial = useMemo(() => {
    const m = new THREE.MeshPhongMaterial();
    m.color = new THREE.Color("#0d1017");
    m.emissive = new THREE.Color("#0b0e14");
    m.emissiveIntensity = 0.12;
    m.shininess = 0.6;
    return m;
  }, []);

  // Country landmasses → rendered as a dotted grid so the globe reads as Earth.
  const countries = useMemo(() => {
    const topo = countriesTopo as unknown as Topology;
    const fc = feature(topo, topo.objects.countries as GeometryCollection);
    return fc.features;
  }, []);

  // Capability + preference detection (client only).
  useEffect(() => {
    setWebgl(hasWebGL());
    const small = window.matchMedia("(max-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => {
      setReduce(rm.matches);
      setLite(small.matches || rm.matches);
    };
    upd();
    small.addEventListener("change", upd);
    rm.addEventListener("change", upd);
    return () => {
      small.removeEventListener("change", upd);
      rm.removeEventListener("change", upd);
    };
  }, []);

  // Only initialize the heavy WebGL scene once the section is near the viewport.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Responsive sizing.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Re-roll arcs periodically so data keeps flying to new cities. Lighter and
  // slower on mobile; static (no interval) under reduced-motion.
  useEffect(() => {
    if (!inView) return;
    const n = lite ? 5 : 9;
    setArcs(randomArcs(n));
    if (reduce) return;
    const id = setInterval(() => setArcs(randomArcs(n)), lite ? 6000 : 4000);
    return () => clearInterval(id);
  }, [inView, lite, reduce]);

  // Configure the renderer + camera once the globe instance has initialized.
  const handleReady = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    const renderer = g.renderer();
    // The key mobile fix: cap the drawing-buffer pixel ratio. Retina phones
    // default to 3x, which makes this canvas render ~9x the pixels and stall.
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    renderer.setPixelRatio(Math.min(dpr, lite ? 1 : 1.5));
    const controls = g.controls();
    controls.enableZoom = false;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 0.6;
    g.pointOfView({ lat: 18, lng: 20, altitude: 2.4 });
    setReady(true);
  }, [lite, reduce]);

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c11]"
    >
      <div className="glow-brand pointer-events-none absolute inset-0 opacity-40" />

      {/* Static CSS-sphere fallback if WebGL is unavailable. */}
      {!webgl && <SphereFallback />}

      {webgl && inView && size.w > 0 && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <Globe
            ref={globeRef}
            onGlobeReady={handleReady}
            width={size.w}
            height={size.h}
            backgroundColor="rgba(0,0,0,0)"
            globeMaterial={globeMaterial}
            atmosphereColor="#F7931A"
            atmosphereAltitude={0.15}
            hexPolygonsData={countries}
            hexPolygonResolution={lite ? 2 : 3}
            hexPolygonMargin={0.32}
            hexPolygonUseDots={true}
            hexPolygonColor={() => "rgba(247,147,26,0.55)"}
            hexPolygonAltitude={0.003}
            pointsData={CITIES}
            pointLat="lat"
            pointLng="lng"
            pointColor={() => "#FFE3B0"}
            pointAltitude={0.018}
            pointRadius={0.45}
            pointsMerge={lite}
            arcsData={arcs}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcColor={() => ["rgba(247,147,26,0.9)", "rgba(74,158,255,0.7)"]}
            arcAltitudeAutoScale={0.45}
            arcStroke={0.5}
            arcDashLength={0.45}
            arcDashGap={1.6}
            arcDashInitialGap={() => Math.random() * 4}
            arcDashAnimateTime={reduce ? 0 : 2400}
            arcsTransitionDuration={0}
            ringsData={lite ? [] : CITIES}
            ringLat="lat"
            ringLng="lng"
            ringColor={() => "rgba(247,147,26,0.5)"}
            ringMaxRadius={2.2}
            ringPropagationSpeed={1.4}
            ringRepeatPeriod={2600}
          />
        </div>
      )}

      {/* Branded loader — fades out when the globe is ready, so a slow init
          never reads as "stuck". */}
      {webgl && !ready && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
          <GlobeLoader />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
            Connecting nodes…
          </span>
        </div>
      )}
    </div>
  );
}

function GlobeLoader() {
  return (
    <div className="relative h-20 w-20">
      <div className="absolute inset-0 rounded-full bg-[#F7931A]/10 blur-xl" />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full motion-safe:animate-spin"
        style={{ animationDuration: "3.5s" }}
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(247,147,26,0.25)"
          strokeWidth="2"
          strokeDasharray="6 10"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="rgba(247,147,26,0.45)"
          strokeWidth="1.5"
          strokeDasharray="3 14"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-2.5 w-2.5 rounded-full bg-[#F7931A] motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

function SphereFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative aspect-square w-[68%] max-w-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 36% 30%, #1b212e 0%, #0c0f15 62%, #07090d 100%)",
          boxShadow:
            "0 0 90px rgba(247,147,26,0.22), inset -22px -22px 70px rgba(0,0,0,0.6)",
        }}
      >
        <div className="bg-dots absolute inset-0 rounded-full opacity-[0.18]" />
        <div className="absolute inset-0 rounded-full ring-1 ring-[#F7931A]/30" />
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFE3B0] shadow-[0_0_10px_#F7931A]" />
      </div>
    </div>
  );
}
