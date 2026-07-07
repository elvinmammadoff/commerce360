"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Editorial section label — a blue→violet gradient word flanked by thin glowing
 * gradient rules on both sides. Shared across every marketing section so the
 * rhythm reads as one premium visual language. `centered` is accepted for API
 * symmetry; both alignments render the same flanked treatment.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 drop-shadow-[0_0_10px_rgba(124,108,255,0.35)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-px w-8 bg-gradient-to-r from-transparent via-brand/40 to-brand/70"
      />
      <span className="bg-gradient-to-r from-brand to-[#a855f7] bg-clip-text text-xs font-semibold tracking-[0.14em] text-transparent uppercase">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="h-px w-8 bg-gradient-to-l from-transparent via-[#a855f7]/40 to-[#a855f7]/70"
      />
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleClassName,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  titleClassName?: string;
}) {
  const reduceMotion = useReducedMotion();

  const item = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14, filter: "blur(5px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
      };

  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col",
        align === "center" ? "mx-auto items-center text-center" : "items-start",
        className,
      )}
    >
      <motion.div {...item} transition={{ duration: 0.4, ease: EASE }}>
        <Eyebrow centered={align === "center"}>{eyebrow}</Eyebrow>
      </motion.div>

      <motion.h2
        {...item}
        transition={{ duration: 0.5, delay: 0.06, ease: EASE }}
        className={"text-display-sm " + cn(
          "mt-5 text-balance",
          "bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent",
          titleClassName,
        )}
      >
        {title}
      </motion.h2>

      {description ? (
        <motion.p
          {...item}
          transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
          className={cn(
            "mt-6 text-lg leading-8 text-pretty text-muted-foreground/70",
            align === "center" && "max-w-xl",
          )}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}
