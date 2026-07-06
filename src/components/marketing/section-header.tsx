"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Restrained editorial eyebrow — a quiet uppercase label with a short brand
 * rule instead of the generic centered blue text. Used across every marketing
 * section so the rhythm stays consistent without looking templated.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("eyebrow", className)}>
      <span
        aria-hidden="true"
        className="h-px w-5 bg-gradient-to-r from-brand/70 to-transparent"
      />
      {children}
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
        <Eyebrow>{eyebrow}</Eyebrow>
      </motion.div>

      <motion.h2
        {...item}
        transition={{ duration: 0.5, delay: 0.06, ease: EASE }}
        className={cn(
          "text-display-sm mt-4 text-balance text-foreground",
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
            "mt-4 text-base leading-relaxed text-pretty text-muted-foreground",
            align === "center" && "max-w-xl",
          )}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}
