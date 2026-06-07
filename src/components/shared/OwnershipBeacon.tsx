/**
 * MediPass — Ownership Beacon Mount
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Client component mounted once in the root layout. Fires the DevTools
 * banner + canary ping on first paint.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useEffect } from "react";
import { printOwnershipBeacon, pingOwnerBeacon } from "@/lib/ownership";

export function OwnershipBeacon(): null {
  useEffect(() => {
    printOwnershipBeacon();
    pingOwnerBeacon();
  }, []);

  return null;
}
