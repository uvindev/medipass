/**
 * MediPass — Root Layout
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OwnershipBeacon } from "@/components/shared/OwnershipBeacon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediPass — Cross-Border Medical Identity Agent",
  description:
    "Store your medical profile once in Terminal 3 Network's TEE-encrypted storage. A Claude agent retrieves only the fields a doctor requests, using BBS+ selective disclosure. Built by Uvin Vindula (IAMUVIN).",
  authors: [{ name: "Uvin Vindula", url: "https://iamuvin.com" }],
  creator: "Uvin Vindula (IAMUVIN)",
  publisher: "Terra Labz",
  applicationName: "MediPass",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://medipass-seven.vercel.app",
  ),
  keywords: [
    "medical identity",
    "Terminal 3 Network",
    "did:t3n",
    "BBS+ selective disclosure",
    "agent auth",
    "verifiable credentials",
    "AI agent",
    "cross-border healthcare",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "MediPass",
    title: "MediPass — Cross-Border Medical Identity Agent",
    description:
      "A clinician's AI agent retrieves only the fields you authorize — via BBS+ selective disclosure on Terminal 3 Network. Consented, revocable, audited. The agent never holds your full record.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediPass — Cross-Border Medical Identity Agent",
    description:
      "Your medical identity, retrieved by an agent — never held in the open. Selective disclosure on Terminal 3 Network.",
    creator: "@iamuvin",
  },
  other: {
    "X-Built-By": "Uvin Vindula - IAMUVIN (iamuvin.com)",
    "X-Copyright": "Copyright (c) 2026 Uvin Vindula. All Rights Reserved.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <OwnershipBeacon />
        {children}
      </body>
    </html>
  );
}
