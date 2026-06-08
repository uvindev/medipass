/**
 * MediPass — App Icon (generated)
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "384px",
            height: "384px",
            borderRadius: "104px",
            background: "#F7931A",
            color: "#0a0a0a",
            fontSize: "300px",
            fontWeight: 800,
          }}
        >
          +
        </div>
      </div>
    ),
    { ...size },
  );
}
