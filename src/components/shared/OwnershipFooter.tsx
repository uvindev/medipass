/**
 * MediPass — Ownership Footer
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

export function OwnershipFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 py-8 text-center text-xs text-neutral-500">
      <p>
        MediPass — Cross-Border Medical Identity Agent on{" "}
        <span className="font-medium text-neutral-700">Terminal 3 Network</span>
      </p>
      <p className="mt-1">
        Built by{" "}
        <a
          href="https://iamuvin.com"
          className="font-semibold text-[#F7931A] hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Uvin Vindula — IAMUVIN
        </a>{" "}
        · Terra Labz · Copyright (c) 2026 · All Rights Reserved
      </p>
    </footer>
  );
}
