/**
 * MediPass — Camera QR Scanner
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Opens the device camera (rear-facing) and decodes a QR with jsQR. Used by a
 * clinician to scan a patient's emergency QR. Stops the camera on result/close.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

export function QrScanner({
  onResult,
  onClose,
}: {
  onResult: (text: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let active = true;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play();

        const tick = () => {
          if (!active) return;
          const v2 = videoRef.current;
          if (v2 && v2.readyState >= 2 && ctx && v2.videoWidth) {
            canvas.width = v2.videoWidth;
            canvas.height = v2.videoHeight;
            ctx.drawImage(v2, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(img.data, img.width, img.height, {
              inversionAttempts: "dontInvert",
            });
            if (code?.data) {
              active = false;
              onResult(code.data);
              return;
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError(
          "Camera unavailable. Grant camera permission (and use HTTPS), or paste the DID instead.",
        );
      }
    }
    void start();

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#0c0e13]">
        <div className="flex items-center justify-between px-4 py-3 text-white">
          <span className="text-sm font-semibold">Scan patient QR</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="rounded-lg px-2 py-1 text-white/70 hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <div className="relative aspect-square w-full bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {!error && (
            <div className="pointer-events-none absolute inset-10 rounded-xl border-2 border-[#F7931A]/80" />
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">
              {error}
            </div>
          )}
        </div>
        <p className="px-4 py-3 text-center text-xs text-white/40">
          Point the camera at a MediPass emergency QR.
        </p>
      </div>
    </div>
  );
}
