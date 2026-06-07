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
