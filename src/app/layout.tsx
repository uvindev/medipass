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
    process.env.NEXT_PUBLIC_APP_URL ?? "https://medipass.vercel.app",
  ),
  other: {
    "X-Built-By": "Uvin Vindula — IAMUVIN (iamuvin.com)",
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
