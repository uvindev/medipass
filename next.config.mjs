/**
 * MediPass — Next.js Configuration
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The T3N SDK is WASM-backed (jco component). Keep it external on the server
  // so the .wasm loads from node_modules at runtime instead of being bundled.
  serverExternalPackages: [
    "@terminal3/t3n-sdk",
    "@terminal3/vc_core",
    "@terminal3/revoke_vc",
  ],
  // Force the jco WASM component into the serverless function bundle on Vercel.
  // Keyed by the exact SDK-using routes (the "/api/**" glob did not reliably
  // match App Router route handlers). node-linker=hoisted (.npmrc) keeps this a
  // real path so Vercel packages it without the "symlinked directories" error.
  outputFileTracingIncludes: {
    "/api/t3n/user": ["./node_modules/@terminal3/**/*.wasm"],
    "/api/t3n/present": ["./node_modules/@terminal3/**/*.wasm"],
    "/api/agent": ["./node_modules/@terminal3/**/*.wasm"],
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
