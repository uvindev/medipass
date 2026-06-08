/**
 * MediPass — Open Graph Image
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Dynamically generated social share image (next/og).
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MediPass — cross-border medical identity agent on Terminal 3";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#0a0a0a",
          backgroundImage:
            "radial-gradient(900px circle at 18% 0%, rgba(247,147,26,0.28), transparent 55%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background: "#F7931A",
              color: "#0a0a0a",
              fontSize: "44px",
              fontWeight: 800,
            }}
          >
            +
          </div>
          <div style={{ fontSize: "34px", fontWeight: 700 }}>MediPass</div>
          <div
            style={{
              display: "flex",
              marginLeft: "16px",
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.15)",
              fontSize: "20px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Live on Terminal 3 testnet
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "66px",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              maxWidth: "1000px",
            }}
          >
            <div style={{ display: "flex" }}>
              Your medical identity, retrieved by an agent —
            </div>
            <div style={{ display: "flex", color: "#F7931A" }}>
              never held in the open.
            </div>
          </div>
          <div
            style={{
              marginTop: "26px",
              fontSize: "27px",
              color: "rgba(255,255,255,0.6)",
              maxWidth: "820px",
            }}
          >
            Cross-border medical identity. Disclosed field-by-field, only with your
            consent — cryptographically proven, fully audited.
          </div>
        </div>

        {/* footer chips */}
        <div style={{ display: "flex", gap: "14px" }}>
          {["did:t3n", "BBS+ selective disclosure", "Agent Auth", "Claude"].map(
            (t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: "22px",
                  color: "#FFB454",
                }}
              >
                {t}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
