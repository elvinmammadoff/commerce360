import Link from "next/link";

import { cn } from "@/lib/utils";

function OrbitMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <defs>
        <linearGradient
          id="c360-mark"
          x1="4"
          y1="4"
          x2="24"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5B8CFF" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {/* Gradient "C" ring with a gap top-right */}
      <circle
        cx="14"
        cy="14"
        r="8.5"
        fill="none"
        stroke="url(#c360-mark)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="44 12"
        transform="rotate(-52 14 14)"
      />
      <circle cx="22" cy="7" r="2.5" fill="url(#c360-mark)" />
    </svg>
  );
}

export function Logo({
  href = "/",
  wordmark = true,
  className,
}: {
  href?: string;
  wordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Orbittify home"
      className={cn(
        "flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <OrbitMark />
      {wordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Orbittify
        </span>
      )}
    </Link>
  );
}
