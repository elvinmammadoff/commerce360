import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-24">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(480px_240px_at_50%_0%,rgba(91,140,255,0.16),transparent)]"
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 200 200"
              className="pointer-events-none absolute -right-16 -bottom-24 size-72 opacity-[0.07]"
            >
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(-18 100 100)" />
              <circle cx="178" cy="72" r="6" className="fill-brand" />
            </svg>

            <div className="relative">
              <h2 className="text-display-sm mx-auto max-w-2xl text-balance">
                Your whole catalog, in every angle — by Friday
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Start with three free renders. If the viewer doesn&apos;t lift
                your product pages, delete the workspace — no card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="glow-brand h-10 px-5">
                  <Link href="/login">
                    Start free <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-10 px-5">
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
