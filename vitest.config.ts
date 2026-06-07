/**
 * MediPass — Vitest Configuration
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // Scope coverage to the logic under test. UI pages, API routes, and the
      // network/WASM SDK layer are exercised by manual + live E2E, not unit tests.
      include: [
        "src/lib/errors.ts",
        "src/lib/watermark.ts",
        "src/types/medical.ts",
        "src/lib/crypto/keys.ts",
        "src/lib/t3n/credentials.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `server-only` throws unless resolved under the bundler's react-server
      // condition. In tests, alias it to a no-op so server modules import.
      "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
    },
  },
});
