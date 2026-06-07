/**
 * MediPass — HTTP Response Watermarks
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

// Add to every API route NextResponse.
// NOTE: HTTP header values must be ASCII (ISO-8859-1) — no em-dashes here, or
// Node throws ERR_INVALID_CHAR and 500s the response.
export const ownershipHeaders: Record<string, string> = {
  "X-Built-By": "Uvin Vindula - IAMUVIN (iamuvin.com)",
  "X-Copyright": "Copyright (c) 2026 Uvin Vindula. All Rights Reserved.",
  "X-License": "Proprietary - See github.com/uvindev/medipass/LICENSE",
};

// robots.txt — blocks AI scrapers
export const robotsTxt = `
User-agent: *
Disallow: /api/

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /
`.trim();
