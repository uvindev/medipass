/**
 * MediPass — Brand Mark
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="11" fill="#0A0A0A" />
      {/* medical cross */}
      <path
        d="M17 11h6v6h6v6h-6v6h-6v-6h-6v-6h6v-6z"
        fill="#F7931A"
      />
      {/* network node accent */}
      <circle cx="29.5" cy="11.5" r="2.4" fill="#FFB454" />
    </svg>
  );
}

export function Logo({
  size = 32,
  showText = true,
}: {
  size?: number;
  showText?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {showText && (
        <span className="text-[15px] font-semibold tracking-tight">
          MediPass
        </span>
      )}
    </span>
  );
}
