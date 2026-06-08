/**
 * MediPass — PWA Manifest
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Enables "Add to Home Screen" so patients can keep MediPass one tap away.
 */

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MediPass — Medical Identity",
    short_name: "MediPass",
    description:
      "Cross-border medical identity agent. Your records, your consent, verifiable anywhere.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#F7931A",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
