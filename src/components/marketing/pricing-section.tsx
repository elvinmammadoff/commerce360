"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/types";

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
  const paid = plans.filter((plan) => plan.priceMonthly !== null);
  const enterprise = plans.find((plan) => plan.priceMonthly === null);

  return (
    <section id={id} className="scroll-mt-24 py-24">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-muted-foreground">
            One credit = one product rendered into every format. Credits roll
            over while you&apos;re subscribed.
          </p>

          <div
            className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
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
                    "rounded-full px-4 py-1.5 text-sm transition-colors duration-150 outline-none",
                    "focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
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
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {paid.map((plan, i) => {
            const price = yearly ? plan.priceYearly : plan.priceMonthly;
            return (
              <Reveal key={plan.id} delay={i * 0.08}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-250",
                    plan.highlighted
                      ? "border-brand/50 bg-card shadow-[0_0_48px_-16px_rgba(91,140,255,0.35)]"
                      : "border-border bg-card/60 hover:border-muted-foreground/30",
                  )}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-2.5 left-6 border-brand/40 bg-brand text-brand-foreground">
                      Most popular
                    </Badge>
                  )}
                  <div>
                    <h3 className="font-medium">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                  </div>
                  <p className="mt-5">
                    <span className="text-4xl font-semibold tracking-tight">
                      {formatCurrency(price ?? 0)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /month{yearly && ", billed yearly"}
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {plan.creditsPerMonth} renders
                    </span>{" "}
                    per month · {plan.videoResolution} video
                  </p>
                  <Button
                    asChild
                    variant={plan.highlighted ? "default" : "outline"}
                    className="mt-6 w-full"
                  >
                    <Link href="/login">
                      Start with {plan.name}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-success"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        {enterprise && (
          <Reveal delay={0.1}>
            <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card/60 p-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-medium">{enterprise.name}</h3>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  {enterprise.features.slice(0, 4).join(" · ")} — built with our
                  team around your pipeline.
                </p>
              </div>
              <Button asChild variant="outline">
                <a href="mailto:sales@commerce360.ai">Talk to sales</a>
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
