/**
 * MediPass — Security
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import type { Metadata } from "next";
import { LegalLayout, Section } from "@/components/shared/LegalLayout";

export const metadata: Metadata = { title: "Security — MediPass" };

export default function SecurityPage() {
  return (
    <LegalLayout title="Security" updated="8 June 2026">
      <p>
        Security is the product. MediPass is designed so that sensitive data is
        disclosed only with consent, proven cryptographically, and never held in
        the open.
      </p>

      <Section heading="How your data is protected">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Medical credentials are stored encrypted in Terminal 3&apos;s
            TEE-backed storage; MediPass never persists raw credential values.
          </li>
          <li>
            The agent receives only BBS+ selectively-disclosed fields — the
            cryptography makes unrequested fields unreadable.
          </li>
          <li>
            Authorization is patient-held and revocable; revocation blocks the
            agent before any data leaves the enclave.
          </li>
          <li>Every access is written to an append-only audit log.</li>
          <li>
            The Terminal 3 API key is server-only and never reaches the browser.
          </li>
        </ul>
      </Section>

      <Section heading="Reporting a vulnerability">
        <p>
          Report security issues privately to{" "}
          <a className="text-[#F7931A] hover:underline" href="mailto:uvin95dev@gmail.com">
            uvin95dev@gmail.com
          </a>
          . Please do not open public issues for security matters. Expect an
          acknowledgement within 72 hours. Include a description, impact, and
          steps to reproduce.
        </p>
      </Section>

      <Section heading="Responsible disclosure">
        <p>
          We ask that you give us a reasonable window to remediate before public
          disclosure, and that you avoid privacy violations, data destruction,
          or service degradation while testing.
        </p>
      </Section>
    </LegalLayout>
  );
}
