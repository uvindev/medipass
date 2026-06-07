/**
 * MediPass — 3D Network Globe
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * A rotating dark globe with glowing city nodes and animated arcs ("data" flying
 * city-to-city). Lazy-loaded client-only (three.js); shows a glow fallback while
 * the WebGL bundle loads.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { GlobeMethods } from "react-globe.gl";

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

export function Globe3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [arcs, setArcs] = useState<Arc[]>([]);

  const globeMaterial = useMemo(() => {
    const m = new THREE.MeshPhongMaterial();
    m.color = new THREE.Color("#0a0c11");
    m.emissive = new THREE.Color("#0a0c11");
    m.emissiveIntensity = 0.1;
    m.shininess = 0.7;
    return m;
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

  // Auto-rotate + framing once the globe instance exists.
  useEffect(() => {
    const id = setInterval(() => {
      const g = globeRef.current;
      if (!g) return;
      const controls = g.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      controls.enableZoom = false;
      g.pointOfView({ lat: 18, lng: 20, altitude: 2.4 });
      clearInterval(id);
    }, 120);
    return () => clearInterval(id);
  }, []);

  // Re-roll arcs periodically so data keeps flying to new cities.
  useEffect(() => {
    setArcs(randomArcs(9));
    const id = setInterval(() => setArcs(randomArcs(9)), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c11]"
    >
      {/* fallback glow while the WebGL chunk loads */}
      <div className="glow-brand absolute inset-0 opacity-40" />
      {size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          atmosphereColor="#F7931A"
          atmosphereAltitude={0.16}
          pointsData={CITIES}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => "#FFB454"}
          pointAltitude={0.012}
          pointRadius={0.32}
          pointsMerge={false}
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
          arcDashAnimateTime={2400}
          arcsTransitionDuration={0}
          ringsData={CITIES}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => "rgba(247,147,26,0.5)"}
          ringMaxRadius={2.2}
          ringPropagationSpeed={1.4}
          ringRepeatPeriod={2600}
        />
      )}
    </div>
  );
}
