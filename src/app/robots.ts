/**
 * MediPass — robots.txt
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/api/",
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "anthropic-ai",
          "CCBot",
          "Google-Extended",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://medipass.vercel.app"}/sitemap.xml`,
  };
}
