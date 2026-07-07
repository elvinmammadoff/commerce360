"use client";

import { Activity, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const BRANDS = [
  { name: "Møbelhuset Nord", className: "font-semibold tracking-tight" },
  { name: "CASA VERDE", className: "font-light tracking-[0.28em]" },
  { name: "Volt & Vine", className: "font-serif italic" },
  { name: "ATELIER RUBEN", className: "font-medium tracking-[0.18em]" },
  { name: "Nordvik", className: "font-bold tracking-tighter" },
  { name: "Hemlund & Co.", className: "font-normal tracking-wide" },
];

/** Enterprise credibility signals — the "trust specs" band under the marquee. */
const SIGNALS = [
  { icon: ShieldCheck, label: "SOC 2 Type II" },
  { icon: Lock, label: "GDPR compliant" },
  { icon: Activity, label: "99.9% uptime SLA" },
  { icon: KeyRound, label: "SSO & SAML" },
];

export function Logos() {
  const reduceMotion = useReducedMotion();
  // Duplicate for seamless marquee loop (marquee-x goes 0 → -50%)
  const items = reduceMotion ? BRANDS : [...BRANDS, ...BRANDS];

  return (
    <section aria-label="Customers" className="relative py-12">
      <div aria-hidden="true" className="divider-glow absolute inset-x-0 top-0" />
      <div aria-hidden="true" className="divider-glow absolute inset-x-0 bottom-0" />
      <div className="container-page">
        <motion.p
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-xs font-medium tracking-wider text-muted-foreground/80 uppercase"
        >
          Trusted by teams replacing studio shoots
        </motion.p>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className={cn(
            "mt-8 overflow-hidden",
            reduceMotion ? "" : "mask-fade-x",
          )}
        >
          <ul
            className={cn(
              "flex items-center gap-x-14",
              reduceMotion
                ? "flex-wrap justify-center gap-y-6"
                : "marquee hover:[animation-play-state:paused]",
            )}
          >
            {items.map((brand, i) => (
              <li
                key={`${brand.name}-${i}`}
                className={cn(
                  "shrink-0 text-[15px] text-muted-foreground/70 transition-colors duration-200 hover:text-foreground/90",
                  brand.className,
                )}
              >
                {brand.name}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Enterprise trust specs */}
        <motion.ul
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-3 text-xs text-muted-foreground/70 sm:gap-x-1"
        >
          {SIGNALS.map((signal, i) => (
            <li key={signal.label} className="flex items-center">
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors duration-200 hover:text-foreground/90">
                <signal.icon className="size-3.5 text-brand/80" aria-hidden="true" />
                <span className="font-medium tracking-tight tabular-nums">
                  {signal.label}
                </span>
              </span>
              {i < SIGNALS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="mx-1 hidden h-3 w-px bg-border sm:block"
                />
              )}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
