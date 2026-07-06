"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { TurntableViewer } from "@/components/app/viewer/turntable-viewer";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: 72, suffix: "", label: "studio frames per product" },
  { value: 4, suffix: "K", label: "orbit video output" },
  { value: 11, suffix: " min", label: "from photo to publish" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16, filter: "blur(6px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.45, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* Faint engineering grid — masked to a soft vignette so it reads as
          texture, never pattern. */}
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(680px_420px_at_50%_0%,black,transparent)]"
      />
      {/* Quiet brand glow behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(600px_320px_at_50%_-40px,rgba(91,140,255,0.14),transparent)]"
      />

      <div className="container-page relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...enter(0)}>
            <Badge
              variant="outline"
              className="gap-2 rounded-full border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm"
            >
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              New — marketplace image sets for Wayfair
            </Badge>
          </motion.div>

          <motion.h1
            {...enter(0.08)}
            className="text-display mt-6 text-balance"
          >
            <span className="text-muted-foreground">One product photo.</span>
            <br />
            Every visual you need to sell.
          </motion.h1>

          <motion.p
            {...enter(0.16)}
            className="mx-auto mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg"
          >
            Commerce360 turns a single image into an interactive 360° viewer, a
            4K orbit video, 72 studio frames, and marketplace-ready sets — in
            about eleven minutes.
          </motion.p>

          <motion.div
            {...enter(0.24)}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="glow-brand h-10 px-5">
              <Link href="/login">
                Start free — 3 renders included
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-10 px-5">
              <a href="#demo">
                See the live demo <ArrowDown aria-hidden="true" />
              </a>
            </Button>
          </motion.div>

          <motion.p
            {...enter(0.3)}
            className="mt-4 text-xs text-muted-foreground"
          >
            No studio. No 3D artist. No credit card to start.
          </motion.p>
        </div>

        <motion.div
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 28, scale: 0.985 },
                animate: { opacity: 1, y: 0, scale: 1 },
                transition: { duration: 0.5, delay: 0.34, ease: EASE },
              })}
          className="relative mx-auto mt-14 max-w-4xl"
        >
          <div className="rounded-3xl border border-border bg-card/60 p-2 shadow-[0_24px_80px_-32px_rgba(91,140,255,0.25)] backdrop-blur-sm">
            <TurntableViewer
              src="/demo/bed.mp4"
              autoRotate
              compact
              productName="Luno Platform Bed"
              className="aspect-[16/10] w-full rounded-2xl"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            This is a real render — drag it. Generated from one catalog photo.
          </p>
        </motion.div>

        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl bg-border/60 ring-1 ring-border sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              {...enter(0.4 + i * 0.06)}
              className="bg-background px-6 py-6 text-center"
            >
              <dd className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber value={stat.value} />
                {stat.suffix}
              </dd>
              <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
