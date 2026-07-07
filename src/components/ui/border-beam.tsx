"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * A light that travels continuously along the border of its parent. Drop it as
 * a child of any `relative rounded-[…]` element — it inherits the radius and
 * masks itself to the border ring. Self-disables under prefers-reduced-motion.
 *
 * Implemented with a rotating conic-gradient (universally supported) rather
 * than offset-path, then clipped to a thin ring via a padding-box/border-box
 * mask.
 */
interface BorderBeamProps {
  /** seconds for one full lap */
  duration?: number;
  /** thickness of the travelling light, in px */
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
  reverse?: boolean;
  className?: string;
}

export function BorderBeam({
  duration = 6,
  borderWidth = 2,
  colorFrom = "#5B8CFF",
  colorTo = "#a855f7",
  delay = 0,
  reverse = false,
  className,
}: BorderBeamProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className ?? ""}`}
      style={{
        border: `${borderWidth}px solid transparent`,
        WebkitMask:
          "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0) border-box",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0) border-box",
        maskComposite: "exclude",
      }}
    >
      <motion.div
        className="absolute inset-[-40%]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${colorFrom} 28deg, ${colorTo} 62deg, transparent 96deg)`,
        }}
        initial={{ rotate: reverse ? 360 : 0 }}
        animate={{ rotate: reverse ? 0 : 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay }}
      />
    </div>
  );
}
