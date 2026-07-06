"use client";

import { Check, ImageUp, Rocket, Workflow } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { SectionHeader } from "@/components/marketing/section-header";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    icon: ImageUp,
    step: "01",
    title: "Upload one photo",
    description:
      "Any catalog or phone shot works — one product, at least 1024px. We handle background cleanup and color calibration.",
  },
  {
    icon: Workflow,
    step: "02",
    title: "The pipeline renders",
    description:
      "Source normalization, 360° orbit generation, 4K enhancement, and frame extraction run automatically — about 11 minutes end to end.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Publish everywhere",
    description:
      "Embed the viewer on your PDP, drop the orbit video into ads, and export image sets cut to each marketplace's spec.",
  },
];

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 sm:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow="How it works"
          title="From flat photo to full product experience"
          description="The same pipeline studios charge thousands to replicate — running as a managed service."
        />

        <div className="relative mt-16">
          {/* Connective rail behind the steps (desktop) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-5 hidden h-px lg:block"
            style={{
              background:
                "linear-gradient(to right, transparent, color-mix(in oklch, var(--border), transparent 20%) 12%, color-mix(in oklch, var(--border), transparent 20%) 88%, transparent)",
            }}
          />

          <ol className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.step}
                {...(reduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 18 },
                      whileInView: { opacity: 1, y: 0 },
                      viewport: { once: true, margin: "-60px" },
                      transition: { duration: 0.5, delay: i * 0.1, ease: EASE },
                    })}
                className="relative flex flex-col"
              >
                {/* Node marker on the rail */}
                <div className="flex items-center gap-4">
                  <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-card ring-1 ring-border">
                    <div className="absolute inset-0 rounded-xl bg-brand/[0.07]" />
                    <step.icon className="relative size-4.5 text-brand" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs tracking-widest text-muted-foreground/60 tabular-nums">
                    STEP {step.step}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {step.step === "02" && (
                  <ul className="mt-5 space-y-2 rounded-xl bg-card/60 p-4 ring-1 ring-border">
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
                                delay: 0.3 + si * 0.06,
                                ease: EASE,
                              },
                            })}
                        className="flex items-center gap-2.5 text-xs text-muted-foreground"
                      >
                        <span className="flex size-4 items-center justify-center rounded-full bg-success/12">
                          <Check className="size-2.5 text-success" aria-hidden="true" />
                        </span>
                        {stage.label}
                        <span
                          className={cn(
                            "ml-auto font-mono text-[10px] text-muted-foreground/50",
                          )}
                        >
                          {stage.engine}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
