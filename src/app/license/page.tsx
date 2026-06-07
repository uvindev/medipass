/**
 * MediPass — License
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import type { Metadata } from "next";
import { LegalLayout, Section } from "@/components/shared/LegalLayout";

export const metadata: Metadata = { title: "License — MediPass" };

export default function LicensePage() {
  return (
    <LegalLayout title="License" updated="7 June 2026">
      <p>
        MediPass is proprietary software. Copyright (c) 2026 Uvin Vindula
        (IAMUVIN). All Rights Reserved. First published 7 June 2026.
      </p>

      <Section heading="Grant">
        <p>
          No license, right, or permission is granted by this page. The Software
          and all associated source code, designs, documentation, and assets are
          the exclusive intellectual property of Uvin Vindula.
        </p>
      </Section>

      <Section heading="Restrictions">
        <p>Without prior written permission from the copyright holder, you may not:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>copy, reproduce, or republish the Software in whole or in part;</li>
          <li>modify, adapt, translate, or create derivative works;</li>
          <li>distribute, sublicense, rent, lease, sell, or transfer it;</li>
          <li>deploy the Software to any host, domain, or environment;</li>
          <li>remove or obscure any copyright, attribution, or ownership notice.</li>
        </ul>
      </Section>

      <Section heading="Permitted evaluation">
        <p>
          Terminal 3 Agent Dev Kit Bounty judges and organizers are granted a
          limited, non-transferable, revocable right to review and evaluate the
          Software solely for judging the competition. This confers no ownership
          and expires at the conclusion of judging.
        </p>
      </Section>

      <Section heading="No warranty">
        <p>
          THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY
          KIND. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY CLAIM, DAMAGES, OR
          LIABILITY ARISING FROM THE SOFTWARE OR ITS USE.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Licensing inquiries:{" "}
          <a className="text-[#F7931A] hover:underline" href="mailto:uvin95dev@gmail.com">
            uvin95dev@gmail.com
          </a>
        </p>
      </Section>
    </LegalLayout>
  );
}
