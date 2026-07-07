"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { GradientBorder } from "@/components/marketing/gradient-border";
import { SectionGlow } from "@/components/marketing/section-glow";
import { SectionHeader } from "@/components/marketing/section-header";
import { Spotlight } from "@/components/marketing/spotlight";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CreditPlan } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PricingSection({
  plans,
  heading = "Pay per product. Credits never expire.",
  id = "pricing",
}: {
  plans: CreditPlan[];
  heading?: string;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section id={id} className="relative scroll-mt-24 py-24 sm:py-28">
      <SectionGlow placement="bottom-center" tone="indigo" size="52rem" intensity={0.1} />
      <div className="container-page">
        <SectionHeader
          eyebrow="Pricing"
          title={heading}
          description="One credit = one complete pipeline render (Flux 2 → Seedance → SeeDVR → 72 frames → 4K video → Share page). Buy only what you need."
        />

        <div className="mx-auto mt-14 grid max-w-6xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => {
            const isPro = Boolean(plan.highlighted);
            return (
              <motion.div
                key={plan.id}
                {...(reduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 18 },
                      whileInView: { opacity: 1, y: 0 },
                      viewport: { once: true, margin: "-60px" },
                      transition: { duration: 0.5, delay: i * 0.08, ease: EASE },
                      whileHover: {
                        y: -6,
                        transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
                      },
                    })}
                className={cn(
                  "group relative isolate flex h-full flex-col rounded-3xl p-7 transition-[box-shadow] duration-300",
                  isPro
                    ? "bg-card elevate-lg"
                    : "bg-card/60 ring-1 ring-border elevate-sm hover:elevate-md",
                )}
              >
                {/* Cursor-tracked brand light behind the content */}
                <Spotlight className="group-hover:opacity-100" />

                {/* Soft blue→violet outer glow — resting on Pro, on hover for the rest */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -inset-px -z-10 rounded-[inherit] bg-linear-to-br from-[#5B8CFF]/25 to-[#8B5CF6]/25 blur-xl transition-opacity duration-500",
                    isPro
                      ? "opacity-70 group-hover:opacity-100"
                      : "opacity-0 group-hover:opacity-60",
                  )}
                />

                {/* Gradient hairline border — always on for Pro, on hover for the rest */}
                <GradientBorder
                  className={cn(
                    "transition-opacity duration-500",
                    isPro ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  )}
                />

                {isPro && (
                  <>
                    {/* Quiet brand wash at the top of the popular plan */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-3xl bg-[radial-gradient(120%_100%_at_50%_0%,color-mix(in_oklch,var(--brand)_18%,transparent),transparent)]"
                    />
                    <span className="absolute -top-px right-7 -translate-y-1/2 rounded-full bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] px-3 py-1 text-[11px] font-semibold text-white shadow-[0_4px_16px_-4px_rgba(124,92,246,0.7)]">
                      Most popular
                    </span>
                  </>
                )}

                <div className="relative">
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {plan.credits} {plan.credits === 1 ? "Credit" : "Credits"}
                  </p>
                </div>

                <p className="relative mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl font-semibold tracking-tight tabular-nums">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">One-time</span>
                </p>
                <p className="relative mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {formatCurrency(plan.perProduct)}
                  </span>{" "}
                  per product
                </p>

                <Button
                  asChild
                  variant={isPro ? "default" : "outline"}
                  className={cn(
                    "relative mt-7 h-11 w-full text-[0.9375rem]",
                    isPro &&
                      "border-transparent bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_8px_28px_-8px_rgba(124,92,246,0.6)] hover:text-white hover:shadow-[0_10px_34px_-6px_rgba(124,92,246,0.85)]",
                  )}
                >
                  <Link href="/signup">
                    {plan.cta}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>

                <ul className="relative mt-7 space-y-3 border-t border-border/70 pt-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-foreground/80"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#7C5CF6] to-[#8B5CF6] shadow-[0_2px_8px_-2px_rgba(124,92,246,0.7)]"
                      >
                        <Check className="size-3 text-white" strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* One-time model reassurance — no subscription */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Check className="size-4 text-success" strokeWidth={3} aria-hidden="true" />
            1 free credit on signup
          </span>
          <span aria-hidden="true" className="text-border">•</span>
          <span>Credits never expire</span>
          <span aria-hidden="true" className="text-border">•</span>
          <span>No subscription</span>
          <span aria-hidden="true" className="text-border">•</span>
          <span>Secure Stripe checkout</span>
        </div>
      </div>
    </section>
  );
}
