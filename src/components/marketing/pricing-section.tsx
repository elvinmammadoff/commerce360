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
import type { Plan } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PricingSection({
  plans,
  heading = "Pricing that scales with your catalog",
  id = "pricing",
}: {
  plans: Plan[];
  heading?: string;
  id?: string;
}) {
  const [yearly, setYearly] = React.useState(false);
  const reduceMotion = useReducedMotion();
  // Two balanced tiers: Starter (neutral) + Growth (the highlighted "Pro" card).
  const paid = plans.filter(
    (plan) => plan.id === "starter" || plan.id === "growth",
  );

  return (
    <section id={id} className="relative scroll-mt-24 py-24 sm:py-28">
      <SectionGlow placement="bottom-center" tone="indigo" size="52rem" intensity={0.1} />
      <div className="container-page">
        <SectionHeader
          eyebrow="Pricing"
          title={heading}
          description="One credit = one product rendered into every format. Credits roll over while you're subscribed."
        />

        {/* Billing toggle — sliding gradient pill */}
        <div className="mt-10 flex justify-center">
          <div
            className="relative inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/70 p-1.5 backdrop-blur-md elevate-sm"
            role="radiogroup"
            aria-label="Billing period"
          >
            {(["Monthly", "Yearly"] as const).map((period) => {
              const isYearly = period === "Yearly";
              const active = yearly === isYearly;
              return (
                <button
                  key={period}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setYearly(isYearly)}
                  className={cn(
                    "relative cursor-pointer rounded-full px-6 py-2 text-[0.9375rem] font-semibold tracking-tight outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="billing-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] shadow-[0_6px_20px_-6px_rgba(124,92,246,0.7)]"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  {period}
                  {isYearly && (
                    <span
                      className={cn(
                        "ml-2 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                        active ? "bg-white/20 text-white" : "bg-success/12 text-success",
                      )}
                    >
                      −17%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl items-stretch gap-6 sm:grid-cols-2">
          {paid.map((plan, i) => {
            const price = yearly ? plan.priceYearly : plan.priceMonthly;
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
                  "group relative isolate flex h-full flex-col rounded-3xl p-7 transition-[box-shadow] duration-300 sm:p-8",
                  isPro
                    ? "bg-card elevate-lg"
                    : "bg-card/60 ring-1 ring-border elevate-sm hover:elevate-md",
                )}
              >
                {/* Cursor-tracked brand light behind the content */}
                <Spotlight className="group-hover:opacity-100" />

                {/* Soft blue→violet outer glow — resting on Pro, on hover for Starter */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -inset-px -z-10 rounded-[inherit] bg-linear-to-br from-[#5B8CFF]/25 to-[#8B5CF6]/25 blur-xl transition-opacity duration-500",
                    isPro
                      ? "opacity-70 group-hover:opacity-100"
                      : "opacity-0 group-hover:opacity-60",
                  )}
                />

                {/* Gradient hairline border — always on for Pro, on hover for Starter */}
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
                  <p className="mt-1.5 text-sm text-muted-foreground">{plan.tagline}</p>
                </div>

                <p className="relative mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl font-semibold tracking-tight tabular-nums">
                    {formatCurrency(price ?? 0)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /month{yearly && ", billed yearly"}
                  </span>
                </p>
                <p className="relative mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {plan.creditsPerMonth} renders
                  </span>{" "}
                  per month · {plan.videoResolution} video
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
                  <Link href="/login">
                    Start with {plan.name}
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
      </div>
    </section>
  );
}
