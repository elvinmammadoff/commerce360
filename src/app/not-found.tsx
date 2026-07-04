import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(480px_240px_at_50%_0%,rgba(91,140,255,0.1),transparent)]"
      />
      <div className="absolute top-6 left-6">
        <Logo />
      </div>

      <div className="relative text-center">
        <div className="relative mx-auto size-40" aria-hidden="true">
          <svg viewBox="0 0 160 160" className="absolute inset-0 text-foreground">
            <ellipse
              cx="80"
              cy="80"
              rx="72"
              ry="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.2"
              transform="rotate(-18 80 80)"
            />
            <circle cx="141" cy="57" r="4.5" className="fill-brand" />
          </svg>
          <p className="absolute inset-0 flex items-center justify-center font-mono text-5xl font-semibold tracking-tight">
            404
          </p>
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          This page spun out of view
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          The URL doesn&apos;t match anything in the catalog. It may have been
          moved, renamed, or never rendered.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft aria-hidden="true" /> Marketing site
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard">
              <LayoutDashboard aria-hidden="true" /> Go to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
