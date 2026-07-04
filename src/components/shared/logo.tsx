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
      <circle
        cx="14"
        cy="14"
        r="6"
        className="stroke-foreground"
        strokeWidth="1.75"
      />
      <ellipse
        cx="14"
        cy="14"
        rx="11.5"
        ry="4.5"
        className="stroke-muted-foreground/50"
        strokeWidth="1"
        transform="rotate(-18 14 14)"
      />
      <circle cx="24.4" cy="10.4" r="2.4" className="fill-brand" />
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
      aria-label="Commerce360 AI home"
      className={cn(
        "flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <OrbitMark />
      {wordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Commerce
          <span className="text-brand">360</span>
        </span>
      )}
    </Link>
  );
}
