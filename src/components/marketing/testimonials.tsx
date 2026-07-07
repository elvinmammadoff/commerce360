"use client";

import { motion, useReducedMotion } from "motion/react";

import { GradientBorder } from "@/components/marketing/gradient-border";
import { SectionGlow } from "@/components/marketing/section-glow";
import { SectionHeader } from "@/components/marketing/section-header";
import { Spotlight } from "@/components/marketing/spotlight";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

function Quote({
  testimonial,
  featured = false,
  index,
}: {
  testimonial: Testimonial;
  featured?: boolean;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.figure
      {...(reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 16 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-60px" },
            transition: { duration: 0.5, delay: index * 0.06, ease: EASE },
            whileHover: {
              y: -4,
              transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
            },
          })}
      className={cn(
        "group relative isolate flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-card p-6 ring-1 ring-foreground/10",
        "shadow-[inset_0_1px_0_0_color-mix(in_oklch,white_4%,transparent)] transition-[box-shadow,--tw-ring-color] duration-300 hover:ring-brand/30 hover:elevate-lg",
        featured && "sm:col-span-2 sm:p-8",
      )}
    >
      <Spotlight className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <GradientBorder className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* Oversized quotation glyph — quiet, sits behind the copy */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 right-4 select-none font-serif text-[7rem] leading-none text-foreground/[0.04]"
      >
        &rdquo;
      </span>
      <blockquote
        className={cn(
          "relative leading-relaxed text-foreground/90",
          featured ? "text-lg sm:text-xl" : "text-[15px]",
        )}
      >
        {testimonial.quote}
      </blockquote>
      <figcaption className="relative flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-secondary text-xs font-medium">
            {testimonial.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{testimonial.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {testimonial.title}, {testimonial.company}
          </p>
        </div>
      </figcaption>
    </motion.figure>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  // Featured lead quote + a clean two-row tile (uses up to five voices so the
  // grid always resolves to full rows — no orphaned cell).
  const shown = items.slice(0, 5);

  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 py-24 sm:py-28"
    >
      <div aria-hidden="true" className="divider-glow absolute inset-x-0 top-0" />
      <SectionGlow placement="left" tone="blue" size="40rem" intensity={0.08} drift />
      <div className="container-page">
        <SectionHeader
          eyebrow="Customers"
          title="Teams that stopped booking studios"
          description="Furniture, electronics, and home brands shipping product pages faster — with fewer returns."
        />

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((testimonial, i) => (
            <Quote
              key={testimonial.name}
              testimonial={testimonial}
              featured={i === 0}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
