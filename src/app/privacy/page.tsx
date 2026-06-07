/**
 * MediPass — Privacy Policy
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 */

import type { Metadata } from "next";
import { LegalLayout, Section } from "@/components/shared/LegalLayout";

export const metadata: Metadata = { title: "Privacy — MediPass" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="8 June 2026">
      <p>
        MediPass is built so that your medical data is disclosed only with your
        consent — field by field, revocably, and never in bulk. This policy
        explains what we hold, where, and how you stay in control.
      </p>

      <Section heading="What we hold, and where">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Your medical credential</strong> is stored as a BBS+
            verifiable credential in Terminal 3 Network&apos;s TEE-encrypted
            storage. It is never held in plaintext by MediPass.
          </li>
          <li>
            <strong>Your account</strong> (email + password) is managed by
            Supabase Auth. Clinician profiles (type, country, specialty,
            hospitals) live in your account metadata.
          </li>
          <li>
            <strong>Identity links + audit logs</strong> (your did:t3n, the
            fields each access disclosed, timestamps, and the requesting
            clinician) are stored in our database for your access history.
          </li>
        </ul>
      </Section>

      <Section heading="Selective disclosure">
        <p>
          When a clinician&apos;s agent requests data, a BBS+ proof discloses
          only the fields you authorized. The agent is cryptographically unable
          to see anything else. No raw credential is ever transferred.
        </p>
      </Section>

      <Section heading="Your controls">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Grant access scoped to specific fields, for a limited time.</li>
          <li>Revoke any authorization instantly — it blocks the agent at once.</li>
          <li>See every access in your dashboard&apos;s append-only history.</li>
          <li>Receive a notification whenever your data is accessed.</li>
        </ul>
      </Section>

      <Section heading="What we never do">
        <p>
          We do not sell your data, use it for advertising, or share it with
          anyone you have not explicitly authorized through a data token.
        </p>
      </Section>

      <Section heading="Subprocessors">
        <p>
          Terminal 3 Network (credential storage + identity), Supabase
          (authentication + database), Anthropic (the Claude agent, which only
          ever receives selectively-disclosed fields), and Vercel (hosting).
        </p>
      </Section>

      <Section heading="Retention & contact">
        <p>
          Audit logs are append-only and retained for your records. To request
          deletion of your account or ask a privacy question, contact{" "}
          <a className="text-[#F7931A] hover:underline" href="mailto:uvin95dev@gmail.com">
            uvin95dev@gmail.com
          </a>
          .
        </p>
        <p className="text-sm text-neutral-500">
          MediPass is a Terminal 3 Agent Dev Kit demonstration running on a test
          network; do not store real medical records during the evaluation
          period.
        </p>
      </Section>
    </LegalLayout>
  );
}
