"use client";

import * as React from "react";
import { ArrowRight, Box, Check, Rocket, UploadCloud } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { Eyebrow } from "@/components/marketing/section-header";
import { SectionGlow } from "@/components/marketing/section-glow";
import { Button } from "@/components/ui/button";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload one photo",
    description:
      "Any catalog or phone shot works — one product, at least 1024px. We handle background cleanup and color calibration.",
    tint: "blue",
  },
  {
    icon: Box,
    title: "The pipeline renders",
    description:
      "Source normalization, 360° orbit generation, 4K enhancement, and frame extraction run automatically — about 11 minutes end to end.",
    tint: "violet",
  },
  {
    icon: Rocket,
    title: "Publish everywhere",
    description:
      "Embed the viewer on your PDP, drop the orbit video into ads, and export image sets cut to each marketplace's spec.",
    tint: "violet",
  },
] as const;

const TINTS: Record<string, { box: string; icon: string }> = {
  blue: { box: "bg-[#5B8CFF]/12 ring-[#5B8CFF]/25", icon: "text-[#7ba3ff]" },
  violet: { box: "bg-[#8B5CF6]/12 ring-[#8B5CF6]/25", icon: "text-[#a78bfa]" },
};

export function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const lastNodeRef = React.useRef<HTMLDivElement>(null);

  // The rail must terminate exactly at the centre of the final node — never
  // trailing below Step 03. We measure the last node's centre relative to the
  // timeline container and pin the line's height to it (kept in sync on resize).
  const [lineHeight, setLineHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const container = timelineRef.current;
    const node = lastNodeRef.current;
    if (!container || !node) return;
    const measure = () => {
      const cRect = container.getBoundingClientRect();
      const nRect = node.getBoundingClientRect();
      const center = nRect.top - cRect.top + nRect.height / 2;
      setLineHeight(Math.max(0, center - 28)); // rail starts at top: 28px
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Fill the connecting line as the timeline scrolls through the viewport.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 78%", "end 55%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    restDelta: 0.001,
  });

  // Each node lights up as the fill passes it (thresholds along the line).
  const glow1 = useTransform(fill, [0, 0.06], [0, 1]);
  const glow2 = useTransform(fill, [0.42, 0.52], [0, 1]);
  const glow3 = useTransform(fill, [0.85, 0.95], [0, 1]);
  const glows = [glow1, glow2, glow3];

  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-24 sm:py-28">
      <SectionGlow placement="right" tone="violet" size="44rem" intensity={0.1} />
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ── Left: heading (sticky) ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="text-display-sm mt-5 text-balance">
              <span className="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
                From flat photo to full product{" "}
              </span>
              <span className="bg-linear-to-r from-[#5B8CFF] to-[#a855f7] bg-clip-text text-transparent">
                experience
              </span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground/70">
              The same pipeline studios charge thousands to replicate — running
              as a managed service.
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="mt-8 h-11 border-[#8B5CF6]/30 bg-white/[0.02] px-5 hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/10"
            >
              <a href="#demo">
                See it in action
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          </div>

          {/* ── Right: scroll-filled timeline ── */}
          <div ref={timelineRef} className="relative">
            {/* Unlit track — a faint rail the glow travels along. */}
            <div
              aria-hidden="true"
              style={{ top: 28, height: lineHeight }}
              className="absolute left-7 w-0.5 -translate-x-1/2 rounded-full bg-white/8"
            />
            {/* Soft bloom — a blurred gradient that blooms the light outward. */}
            <motion.div
              aria-hidden="true"
              style={{ top: 28, height: lineHeight, scaleY: reduceMotion ? 1 : fill }}
              className="absolute left-7 w-[7px] -translate-x-1/2 origin-top rounded-full bg-linear-to-b from-[#5B8CFF] via-[#7c6cff] to-[#a855f7] opacity-60 blur-[7px]"
            />
            {/* Crisp gradient fill with a tight glow. */}
            <motion.div
              aria-hidden="true"
              style={{ top: 28, height: lineHeight, scaleY: reduceMotion ? 1 : fill }}
              className="absolute left-7 w-0.5 -translate-x-1/2 origin-top rounded-full bg-linear-to-b from-[#5B8CFF] via-[#7c6cff] to-[#c084fc] shadow-[0_0_16px_1px_rgba(124,108,255,0.85)]"
            />

            <ol className="relative z-10 flex flex-col gap-6">
              {STEPS.map((step, i) => {
                const tint = TINTS[step.tint];
                return (
                  <motion.li
                    key={step.title}
                    {...(reduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, y: 20 },
                          whileInView: { opacity: 1, y: 0 },
                          viewport: { once: true, margin: "-80px" },
                          transition: { duration: 0.5, ease: EASE },
                        })}
                    className="flex gap-5 sm:gap-6"
                  >
                    {/* Node on the rail */}
                    <div
                      ref={i === STEPS.length - 1 ? lastNodeRef : undefined}
                      className="relative flex size-14 shrink-0 items-center justify-center rounded-full"
                    >
                      <div className="absolute inset-0 rounded-full border border-white/12 bg-[#0a0a0d]" />
                      <motion.div
                        aria-hidden="true"
                        style={{ opacity: reduceMotion ? 1 : glows[i] }}
                        className="absolute inset-0 rounded-full bg-linear-to-br from-[#5B8CFF] to-[#a855f7] shadow-[0_0_26px_-2px_rgba(139,92,246,0.75)]"
                      />
                      <span className="relative font-mono text-sm font-semibold text-white tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Card */}
                    <div className="flex-1 rounded-2xl bg-[#0d0d11]/70 p-6 ring-1 ring-white/8 backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <span
                          className={cn(
                            "flex size-12 shrink-0 items-center justify-center rounded-xl ring-1",
                            tint.box,
                          )}
                        >
                          <step.icon
                            className={cn("size-6", tint.icon)}
                            aria-hidden="true"
                          />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold tracking-tight text-foreground">
                            {step.title}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Pipeline stage list — only on the render step */}
                      {i === 1 && (
                        <ul className="mt-5 space-y-3 rounded-xl bg-black/25 p-4 ring-1 ring-white/6">
                          {PIPELINE_STAGES.slice(1).map((stage, si) => (
                            <motion.li
                              key={stage.id}
                              {...(reduceMotion
                                ? {}
                                : {
                                    initial: { opacity: 0, x: -6 },
                                    whileInView: { opacity: 1, x: 0 },
                                    viewport: { once: true },
                                    transition: {
                                      duration: 0.35,
                                      delay: 0.15 + si * 0.06,
                                      ease: EASE,
                                    },
                                  })}
                              className="flex items-center gap-3 text-sm"
                            >
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]">
                                <Check
                                  className="size-3 text-white"
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="text-foreground/90">
                                {stage.label}
                              </span>
                              <span className="ml-auto font-mono text-xs text-muted-foreground">
                                {stage.engine}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
