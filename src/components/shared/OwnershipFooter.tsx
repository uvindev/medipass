/**
 * MediPass — Ownership Footer
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { Logo } from "@/components/ui/Logo";

export function OwnershipFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 pt-8 text-center">
      <div className="flex flex-col items-center gap-3">
        <Logo size={26} />
        <p className="max-w-md text-xs leading-relaxed text-neutral-500">
          Cross-border medical identity agent on{" "}
          <span className="font-medium text-neutral-700">Terminal 3 Network</span>
          . Built for the T3N Agent Dev Kit bounty.
        </p>
        <p className="text-xs text-neutral-400">
          Built by{" "}
          <a
            href="https://iamuvin.com"
            className="font-semibold text-[#F7931A] hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Uvin Vindula — IAMUVIN
          </a>{" "}
          · Terra Labz | inSITE Campus · © 2026 · All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
