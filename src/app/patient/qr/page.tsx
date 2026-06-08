/**
 * MediPass — Emergency QR + Card
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Generates the patient's emergency QR (encodes a public /e/<id> URL), with
 * options to download the QR, download/share an emergency card image (to save
 * to a phone), and a preview of the public info.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { OwnershipFooter } from "@/components/shared/OwnershipFooter";
import { Badge } from "@/components/ui/Badge";

interface Emergency {
  fullName: string;
  bloodType: string;
  allergies: string[];
  contactName: string;
  contactPhone: string;
}

function download(dataUrl: string, name: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = name;
  a.click();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function buildCard(qrUrl: string, info: Emergency): Promise<string> {
  const W = 640;
  const H = 900;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return qrUrl;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  // header
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(0, 0, W, 76);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.fillText("EMERGENCY MEDICAL INFO", 32, 48);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "bold 15px Arial, sans-serif";
  ctx.fillText("PATIENT", 32, 132);
  ctx.fillStyle = "#0a0a0a";
  ctx.font = "bold 38px Arial, sans-serif";
  ctx.fillText(info.fullName.slice(0, 28), 32, 176);

  // blood box
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(32, 212, 112, 112);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(info.bloodType, 88, 282);
  ctx.textAlign = "left";

  ctx.fillStyle = "#b91c1c";
  ctx.font = "bold 15px Arial, sans-serif";
  ctx.fillText("BLOOD GROUP", 168, 236);
  ctx.fillStyle = "#6b7280";
  ctx.font = "bold 14px Arial, sans-serif";
  ctx.fillText("ALLERGIES", 168, 272);
  ctx.fillStyle = "#0a0a0a";
  ctx.font = "500 19px Arial, sans-serif";
  const allergies = info.allergies.length
    ? info.allergies.join(", ")
    : "None on record";
  ctx.fillText(allergies.slice(0, 44), 168, 300);

  // contact
  ctx.fillStyle = "#9ca3af";
  ctx.font = "bold 15px Arial, sans-serif";
  ctx.fillText("EMERGENCY CONTACT", 32, 378);
  ctx.fillStyle = "#0a0a0a";
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillText(info.contactName || "—", 32, 410);
  ctx.fillStyle = "#16a34a";
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.fillText(info.contactPhone || "", 32, 444);

  // QR
  const qrImg = await loadImage(qrUrl);
  ctx.drawImage(qrImg, (W - 280) / 2, H - 360, 280, 280);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "500 16px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Scan for verified emergency info · MediPass", W / 2, H - 40);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}

export default function PatientQRPage() {
  const [publicId, setPublicId] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");
  const [qr, setQr] = useState<string | null>(null);
  const [info, setInfo] = useState<Emergency | null>(null);
  const [card, setCard] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "none">("loading");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/patient");
      if (!res.ok) return setStatus("none");
      const body = (await res.json()) as {
        data: { identity: { publicId: string } | null };
      };
      const id = body.data.identity?.publicId;
      if (!id) return setStatus("none");
      setPublicId(id);

      const link = `${window.location.origin}/e/${id}`;
      setUrl(link);
      const qrUrl = await QRCode.toDataURL(link, {
        width: 360,
        margin: 1,
        color: { dark: "#0A0A0A", light: "#FFFFFF" },
      });
      setQr(qrUrl);

      const eRes = await fetch(`/api/e/${id}`);
      if (eRes.ok) {
        const eBody = (await eRes.json()) as { data: Emergency };
        setInfo(eBody.data);
        try {
          setCard(await buildCard(qrUrl, eBody.data));
        } catch {
          /* canvas unavailable — card download falls back to the QR */
        }
      }
      setStatus("ready");
    })();
  }, []);

  const share = useCallback(async () => {
    try {
      const src = card ?? qr;
      if (src) {
        const blob = await (await fetch(src)).blob();
        const file = new File([blob], "medipass-emergency.png", {
          type: "image/png",
        });
        const nav = navigator as Navigator & {
          canShare?: (d: ShareData) => boolean;
        };
        if (nav.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "MediPass Emergency Card" });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: "MediPass Emergency", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      alert("Emergency link copied to clipboard.");
    } catch {
      /* user cancelled share */
    }
  }, [card, qr, url]);

  return (
    <main className="min-h-screen bg-[#fbfbfa]">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/patient/dashboard"
          className="text-sm text-neutral-500 hover:text-[#F7931A]"
        >
          ← Dashboard
        </Link>
        <div className="mt-3">
          <Badge tone="brand">Emergency QR</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Your emergency card
          </h1>
          <p className="mt-2 text-neutral-600">
            Anyone who scans this sees only your name, blood group, allergies, and
            emergency contact — never your full record. Save it to your phone or
            print it for your wallet.
          </p>
        </div>

        {status === "none" && (
          <div className="card mt-8 p-8 text-center">
            <p className="text-neutral-600">
              No medical identity yet. Set up your profile first.
            </p>
            <Link
              href="/patient/setup"
              className="mt-5 inline-block rounded-lg bg-[#F7931A] px-5 py-2.5 font-semibold text-black hover:bg-[#ffb454]"
            >
              Set up your profile
            </Link>
          </div>
        )}

        {status === "ready" && (
          <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
            <div className="card flex flex-col items-center p-5">
              {qr && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr}
                  alt="Emergency QR code"
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
              )}
              <p className="mt-3 max-w-[220px] break-all text-center font-mono text-[11px] text-neutral-400">
                {url}
              </p>
            </div>

            <div className="space-y-4">
              {info && (
                <div className="card p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    What the public sees
                  </div>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <Row k="Name" v={info.fullName} />
                    <Row k="Blood group" v={info.bloodType} />
                    <Row
                      k="Allergies"
                      v={info.allergies.length ? info.allergies.join(", ") : "None"}
                    />
                    <Row
                      k="Emergency contact"
                      v={`${info.contactName}${info.contactPhone ? " · " + info.contactPhone : ""}`}
                    />
                  </dl>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => qr && download(qr, "medipass-qr.png")}
                  className="rounded-lg bg-[#F7931A] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#ffb454]"
                >
                  Download QR
                </button>
                <button
                  onClick={() =>
                    download(card ?? qr ?? "", "medipass-emergency-card.png")
                  }
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[#F7931A]"
                >
                  Download card
                </button>
                <button
                  onClick={share}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[#F7931A]"
                >
                  Save to phone
                </button>
                <Link
                  href={`/e/${publicId}`}
                  target="_blank"
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-center text-sm font-semibold transition hover:border-[#F7931A]"
                >
                  Preview card
                </Link>
              </div>
              <p className="text-xs leading-relaxed text-neutral-400">
                &ldquo;Save to phone&rdquo; shares the card image — on a phone you
                can save it to Photos and set it as your lock-screen medical ID,
                or add MediPass to your home screen. Native Apple/Google Wallet
                passes are on the roadmap.
              </p>
            </div>
          </div>
        )}

        <OwnershipFooter />
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{k}</dt>
      <dd className="text-right font-medium text-neutral-900">{v}</dd>
    </div>
  );
}
