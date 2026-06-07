/**
 * MediPass — Next.js Configuration
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

// Files to bundle into the SDK-using serverless functions on Vercel: the jco
// WASM component (external t3n-sdk) plus its bytecodealliance deps.
const SDK_TRACE = [
  "./node_modules/@terminal3/t3n-sdk/**",
  "./node_modules/@bytecodealliance/**",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only the WASM SDK stays external (jco component can't be bundled). vc_core /
  // revoke_vc are pure JS and MUST be bundled so webpack resolves the
  // did-jwt(CJS) -> @scure/base(ESM) interop — otherwise Vercel's runtime throws
  // ERR_REQUIRE_ESM (Node allows require(ESM) locally; Vercel's loader does not).
  serverExternalPackages: ["@terminal3/t3n-sdk"],
  // Force the jco WASM component into the serverless function bundle on Vercel.
  // Keyed by the exact SDK-using routes (the "/api/**" glob did not reliably
  // match App Router route handlers). node-linker=hoisted (.npmrc) keeps this a
  // real path so Vercel packages it without the "symlinked directories" error.
  outputFileTracingIncludes: {
    "/api/t3n/user": SDK_TRACE,
    "/api/t3n/present": SDK_TRACE,
    "/api/agent": SDK_TRACE,
    "/api/health/sdk": SDK_TRACE,
  },
  // Ownership watermarks applied on every HTTP response at the edge.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Built-By", value: "Uvin Vindula - IAMUVIN (iamuvin.com)" },
          {
            key: "X-Copyright",
            value: "Copyright (c) 2026 Uvin Vindula. All Rights Reserved.",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
