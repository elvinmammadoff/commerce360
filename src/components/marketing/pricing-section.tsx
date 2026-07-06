"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { SectionHeader } from "@/components/marketing/section-header";
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
  const paid = plans.filter((plan) => plan.priceMonthly !== null);
  const enterprise = plans.find((plan) => plan.priceMonthly === null);

  return (
    <section id={id} className="scroll-mt-24 py-24 sm:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow="Pricing"
          title={heading}
          description="One credit = one product rendered into every format. Credits roll over while you're subscribed."
        />

        {/* Billing toggle — sliding pill */}
        <div className="mt-8 flex justify-center">
          <div
            className="inline-flex items-center rounded-full border border-border bg-card p-1"
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
                    "relative cursor-pointer rounded-full px-4 py-1.5 text-sm outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50",
                    active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="billing-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-primary"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  {period}
                  {isYearly && (
                    <span className={cn("ml-1.5 text-xs", active ? "opacity-70" : "text-success")}>
                      −17%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid items-start gap-4 lg:grid-cols-3">
          {paid.map((plan, i) => {
            const price = yearly ? plan.priceYearly : plan.priceMonthly;
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
                    })}
                className={cn(
                  "group relative flex h-full flex-col rounded-2xl p-6 transition-[box-shadow,--tw-ring-color] duration-300",
                  plan.highlighted
                    ? "bg-card ring-1 ring-brand/40 elevate-lg lg:-my-2 lg:py-8"
                    : "bg-card/50 ring-1 ring-border hover:ring-foreground/20 hover:elevate-md",
                )}
              >
                {plan.highlighted && (
                  <>
                    {/* Quiet brand wash at the top of the popular plan */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-2xl bg-[radial-gradient(120%_100%_at_50%_0%,color-mix(in_oklch,var(--brand)_16%,transparent),transparent)]"
                    />
                    <span className="absolute -top-px right-6 -translate-y-1/2 rounded-full bg-brand px-2.5 py-1 text-[11px] font-medium text-brand-foreground shadow-[0_2px_12px_-2px_color-mix(in_oklch,var(--brand)_60%,transparent)]">
                      Most popular
                    </span>
                  </>
                )}
                <div className="relative">
                  <h3 className="font-medium tracking-tight">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                <p className="relative mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight tabular-nums">
                    {formatCurrency(price ?? 0)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /month{yearly && ", billed yearly"}
                  </span>
                </p>
                <p className="relative mt-1.5 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {plan.creditsPerMonth} renders
                  </span>{" "}
                  per month · {plan.videoResolution} video
                </p>
                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className="relative mt-6 w-full"
                >
                  <Link href="/login">
                    Start with {plan.name}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <ul className="relative mt-6 space-y-2.5 border-t border-border pt-5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success/12">
                        <Check className="size-2.5 text-success" aria-hidden="true" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {enterprise && (
          <motion.div
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 16 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-60px" },
                  transition: { duration: 0.5, delay: 0.1, ease: EASE },
                })}
            className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl bg-card/50 p-6 ring-1 ring-border sm:flex-row sm:items-center"
          >
            <div>
              <h3 className="font-medium tracking-tight">{enterprise.name}</h3>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {enterprise.features.slice(0, 4).join(" · ")} — built with our
                team around your pipeline.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <a href="mailto:sales@commerce360.ai">Talk to sales</a>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
