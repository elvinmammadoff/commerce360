"use client";

import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  CirclePlay,
  Headphones,
  Images,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { TurntableViewer } from "@/components/app/viewer/turntable-viewer";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Stat = {
  icon?: LucideIcon;
  text?: string;
  value: string;
  label: string;
  color: "violet" | "blue" | "pink" | "green";
};

const STATS: Stat[] = [
  { icon: Images, value: "72", label: "studio frames per product", color: "violet" },
  { text: "4K", value: "4K", label: "orbit video output", color: "blue" },
  { icon: Timer, value: "11 min", label: "from photo to publish", color: "pink" },
  { icon: Headphones, value: "24/7", label: "AI Support", color: "green" },
];

const TINTS: Record<Stat["color"], { box: string; icon: string }> = {
  violet: {
    box: "bg-[#8B5CF6]/12 ring-[#8B5CF6]/25",
    icon: "text-[#a78bfa] drop-shadow-[0_0_10px_rgba(139,92,246,0.6)]",
  },
  blue: {
    box: "bg-[#5B8CFF]/12 ring-[#5B8CFF]/25",
    icon: "text-[#7ba3ff] drop-shadow-[0_0_10px_rgba(91,140,255,0.6)]",
  },
  pink: {
    box: "bg-[#d946ef]/12 ring-[#d946ef]/25",
    icon: "text-[#e879f9] drop-shadow-[0_0_10px_rgba(217,70,239,0.55)]",
  },
  green: {
    box: "bg-emerald-500/12 ring-emerald-500/25",
    icon: "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.55)]",
  },
};

const TRUST = [
  "No studio",
  "No 3D artist",
  "No credit card to start",
  "1 free credit on signup",
  "No subscription — credits never expire",
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
          transition: { duration: 0.5, delay, ease: EASE },
        };

  // Headline lines reveal one after another for a more crafted entrance.
  const line = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36">
      {/* Faint engineering grid — masked to a soft vignette so it reads as
          texture, never pattern. */}
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(900px_520px_at_20%_0px,black,transparent)]"
      />
      {/* Brand key light behind the headline + a violet counter-light on the
          product side. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.16),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="float-slower pointer-events-none absolute top-20 right-[-6%] hidden size-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.16),transparent_70%)] blur-2xl lg:block"
      />

      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          {/* ── Left: message ── */}
          <div className="flex max-w-xl flex-col items-start">
            <motion.div {...enter(0)}>
              {/* Pill with a flowing animated gradient border */}
              <div className="group relative inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm">
                <span
                  aria-hidden="true"
                  className="animate-gradient-x pointer-events-none absolute inset-0 rounded-full p-px"
                  style={{
                    background:
                      "linear-gradient(to right, #5B8CFF, #a855f7, #5B8CFF)",
                    backgroundSize: "300% 100%",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                  }}
                />
                <Sparkles className="size-3.5 text-[#a78bfa]" aria-hidden="true" />
                AI-Powered Product Visualization Platform
              </div>
            </motion.div>

            <h1 className="text-display mt-6 text-left text-balance">
              <motion.span {...line(0.08)} className="block text-foreground">
                One product photo.
              </motion.span>
              <motion.span
                {...line(0.2)}
                className="block bg-linear-to-r from-[#5B8CFF] to-[#a855f7] bg-clip-text text-transparent"
              >
                Every visual you need to sell.
              </motion.span>
            </h1>

            <motion.p
              {...enter(0.16)}
              className="mt-5 max-w-lg text-base text-pretty text-muted-foreground sm:text-lg"
            >
              Commerce360 turns a single image into an interactive 360° viewer,
              orbit videos, marketplace-ready image sets and AI product assets.
              All in minutes, not days.
            </motion.p>

            <motion.div
              {...enter(0.24)}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                asChild
                size="lg"
                className="h-11 border-transparent bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] px-6 text-white shadow-[0_8px_28px_-8px_rgba(124,92,246,0.6)] hover:text-white hover:shadow-[0_10px_34px_-6px_rgba(124,92,246,0.85)]"
              >
                <Link href="/signup">
                  Start free
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 border-white/12 bg-white/[0.02] px-5 backdrop-blur-sm"
              >
                <a href="#demo">
                  Live demo
                  <CirclePlay aria-hidden="true" />
                </a>
              </Button>
            </motion.div>

            <motion.ul
              {...enter(0.32)}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
            >
              {TRUST.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CircleCheck className="size-4 shrink-0 text-brand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ── Right: the live product ── */}
          <motion.div
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 24, scale: 0.98 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  transition: { duration: 0.6, delay: 0.2, ease: EASE },
                })}
            className="relative lg:pl-4"
          >
            {/* Neon bloom — blue upper-left, violet lower-right */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.75rem] bg-[radial-gradient(45%_45%_at_68%_62%,rgba(139,92,246,0.42),transparent_70%),radial-gradient(45%_45%_at_32%_34%,rgba(91,140,255,0.32),transparent_70%)] blur-2xl"
            />
            {/* Gradient border frame + travelling border light */}
            <div className="relative rounded-[1.9rem] bg-linear-to-br from-[#5B8CFF]/60 via-white/5 to-[#8B5CF6]/60 p-px shadow-[0_0_90px_-16px_rgba(139,92,246,0.6)]">
              <div className="rounded-[1.85rem] bg-card/80 p-2 backdrop-blur-md">
                <TurntableViewer
                  src="/demo/bed.mp4"
                  autoRotate
                  compact
                  productName="Luno Platform Bed"
                  className="aspect-[16/10] w-full rounded-[1.55rem]"
                />
              </div>
              {/* Two lights chase the border on opposite sides */}
              <BorderBeam duration={7} borderWidth={2} />
              <BorderBeam
                duration={7}
                delay={3.5}
                borderWidth={2}
                colorFrom="#a855f7"
                colorTo="#5B8CFF"
              />
            </div>

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <Sparkles className="size-3.5 shrink-0 text-[#a78bfa]" aria-hidden="true" />
              This is a real render — drag it. Generated from one catalog photo.
            </p>
          </motion.div>
        </div>

        {/* ── Stats bar (full width, iconized) ── */}
        <div className="mt-14 overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.08] backdrop-blur-sm">
          <dl className="grid grid-cols-2 gap-px md:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...enter(0.36 + i * 0.05)}
                className="flex items-center gap-3.5 bg-[#0a0a0d]/90 px-5 py-6"
              >
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1",
                    TINTS[stat.color].box,
                  )}
                >
                  {stat.text ? (
                    <span className={cn("text-sm font-bold", TINTS[stat.color].icon)}>
                      {stat.text}
                    </span>
                  ) : stat.icon ? (
                    <stat.icon
                      className={cn("size-5", TINTS[stat.color].icon)}
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
                <div className="min-w-0">
                  <dd className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
                    {stat.value}
                  </dd>
                  <dt className="text-xs leading-tight text-muted-foreground">
                    {stat.label}
                  </dt>
                </div>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
