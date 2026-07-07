"use client";

import * as React from "react";
import { ImageIcon, Rotate3d, Film, Store, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { AnimatedBeam } from "@/components/ui/animated-beam";
import { SectionGlow } from "@/components/marketing/section-glow";
import { SectionHeader } from "@/components/marketing/section-header";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Measurable node — stable layout box (opacity+scale only, so beam endpoints
 *  stay locked to the node's centre while it animates in). */
const Node = React.forwardRef<
  HTMLDivElement,
  { className?: string; children: React.ReactNode; delay?: number; reduce?: boolean }
>(({ className, children, delay = 0, reduce }, ref) => (
  <motion.div
    ref={ref}
    {...(reduce
      ? {}
      : {
          initial: { opacity: 0, scale: 0.9 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.5, delay, ease: EASE },
        })}
    className={cn(
      "relative z-10 flex items-center justify-center rounded-2xl bg-card ring-1 ring-foreground/10",
      "shadow-[0_1px_0_0_color-mix(in_oklch,white_5%,transparent)_inset,0_18px_40px_-24px_rgba(0,0,0,0.9)]",
      className,
    )}
  >
    {children}
  </motion.div>
));
Node.displayName = "Node";

const OUTPUTS = [
  { icon: Rotate3d, label: "360° viewer", meta: "28 KB embed", curvature: -95 },
  { icon: Film, label: "Orbit video", meta: "4K · H.265", curvature: -32 },
  { icon: Store, label: "Marketplace images", meta: "6 channel specs", curvature: 32 },
  { icon: Sparkles, label: "AI product assets", meta: "titles · copy · alt", curvature: 95 },
] as const;

/** Icon tints walk blue → violet down the stack, echoing the beam gradient. */
const OUTPUT_TINTS = [
  "bg-[#5B8CFF]/12 text-[#7ba3ff] ring-[#5B8CFF]/25",
  "bg-[#6d8bff]/12 text-[#8aa4ff] ring-[#6d8bff]/25",
  "bg-[#9a72f0]/12 text-[#b39bf5] ring-[#9a72f0]/25",
  "bg-[#8B5CF6]/12 text-[#a78bfa] ring-[#8B5CF6]/25",
] as const;

export function ProductPipeline() {
  const reduceMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sourceRef = React.useRef<HTMLDivElement>(null);
  const outRefs = [
    React.useRef<HTMLDivElement>(null),
    React.useRef<HTMLDivElement>(null),
    React.useRef<HTMLDivElement>(null),
    React.useRef<HTMLDivElement>(null),
  ];

  return (
    <section id="pipeline" className="relative scroll-mt-24 py-24 sm:py-28">
      <div aria-hidden="true" className="divider-glow absolute inset-x-0 top-0" />
      <SectionGlow placement="bottom-right" tone="violet" size="34rem" intensity={0.06} />
      {/* soft key light behind the graph */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-72 max-w-3xl bg-[radial-gradient(600px_200px_at_50%_50%,rgba(91,140,255,0.08),transparent_70%)]"
      />
      <div className="container-page">
        <SectionHeader
          eyebrow="One input, everything out"
          title="One photo becomes your entire catalog"
          description="Upload a single product shot. Commerce360 returns every asset your storefront, ads, and marketplaces need — from one credit, in about eleven minutes."
        />

        <div
          ref={containerRef}
          className="relative mx-auto mt-16 flex h-[420px] max-w-3xl items-center justify-between gap-4 px-2 sm:h-[440px] sm:px-6"
        >
          {/* Source — the single photo */}
          <Node
            ref={sourceRef}
            reduce={!!reduceMotion}
            className="size-24 shrink-0 flex-col gap-1.5 sm:size-32"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-3 -z-10 rounded-[1.6rem] bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.22),transparent_70%)] blur-lg"
            />
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand/12 ring-1 ring-brand/25 sm:size-11">
              <ImageIcon className="size-4 text-brand sm:size-5" aria-hidden="true" />
            </span>
            <span className="px-2 text-center font-mono text-[9px] leading-tight text-muted-foreground sm:text-[10px]">
              1 photo
            </span>
          </Node>

          {/* Outputs — the delivered assets */}
          <div className="flex h-full max-w-[15rem] flex-1 flex-col justify-between py-1 sm:max-w-xs">
            {OUTPUTS.map((out, i) => (
              <Node
                key={out.label}
                ref={outRefs[i]}
                reduce={!!reduceMotion}
                delay={0.15 + i * 0.1}
                className="h-[4.25rem] gap-3 px-3 sm:px-4"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl ring-1",
                    OUTPUT_TINTS[i],
                  )}
                >
                  <out.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-foreground sm:text-sm">
                    {out.label}
                  </span>
                  <span className="block truncate font-mono text-[10px] text-muted-foreground">
                    {out.meta}
                  </span>
                </span>
              </Node>
            ))}
          </div>

          {/* Beams: one source → four outputs */}
          {outRefs.map((toRef, i) => (
            <AnimatedBeam
              key={i}
              containerRef={containerRef}
              fromRef={sourceRef}
              toRef={toRef}
              curvature={OUTPUTS[i].curvature}
              duration={3.6}
              delay={i * 0.28}
              pathWidth={2}
              pathColor="#5B8CFF"
              pathOpacity={0.24}
              gradientStartColor="#5B8CFF"
              gradientStopColor="#a78bfa"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
