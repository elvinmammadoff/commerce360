"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";

const EASE = [0.16, 1, 0.3, 1] as const;

export function FinalCta() {
  const reduceMotion = useReducedMotion();

  const enter = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14, filter: "blur(5px)" },
          whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay, ease: EASE },
        };

  return (
    <section className="relative py-28">
      <div className="container-page">
        <motion.div
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 24 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: "-60px" },
                transition: { duration: 0.6, ease: EASE },
              })}
          className="gradient-ring relative isolate overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0a0a0d] px-6 py-20 text-center shadow-[0_50px_140px_-50px_rgba(91,140,255,0.45)] sm:px-16"
        >
          {/* Engineering grid — masked vignette texture */}
          <div
            aria-hidden="true"
            className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(620px_320px_at_50%_0,black,transparent)]"
          />
          {/* Drifting brand aurora */}
          <div
            aria-hidden="true"
            className="aurora absolute top-0 left-1/2 h-[440px] w-[720px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.30),transparent_60%)] blur-2xl"
          />
          {/* Violet counter-glow */}
          <div
            aria-hidden="true"
            className="aurora-slow absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.16),transparent_65%)] blur-2xl"
          />

          {/* Orbital motif — slow continuous rotation */}
          <motion.svg
            aria-hidden="true"
            viewBox="0 0 200 200"
            className="pointer-events-none absolute -right-20 -bottom-28 size-80 text-foreground opacity-[0.09]"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 80, ease: "linear", repeat: Infinity }}
          >
            <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeWidth="1" />
            <ellipse cx="100" cy="100" rx="94" ry="34" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(-18 100 100)" />
            <ellipse cx="100" cy="100" rx="94" ry="34" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(52 100 100)" />
            <circle cx="182" cy="66" r="5" className="fill-brand" />
            <circle cx="26" cy="128" r="3" className="fill-brand/70" />
          </motion.svg>

          <div className="relative">
            <motion.h2
              {...enter(0.1)}
              className="text-display-sm text-sheen mx-auto max-w-2xl text-balance"
            >
              Your whole catalog, in every angle — by Friday
            </motion.h2>
            <motion.p
              {...enter(0.18)}
              className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground"
            >
              Start with three free renders. If the viewer doesn&apos;t lift
              your product pages, delete the workspace — no card required.
            </motion.p>
            <motion.div
              {...enter(0.26)}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Button asChild size="lg" className="glow-brand h-11 px-6">
                <Link href="/login">
                  Start free <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 border-white/12 bg-white/[0.02] px-6 backdrop-blur-sm"
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
