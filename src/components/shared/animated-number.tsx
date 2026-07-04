"use client";

import * as React from "react";
import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";

import { formatNumber } from "@/lib/format";

/**
 * Counts up when scrolled into view. Respects reduced motion by rendering
 * the final value immediately.
 */
export function AnimatedNumber({
  value,
  format = formatNumber,
  duration = 0.9,
}: {
  value: number;
  format?: (value: number) => string;
  duration?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = React.useState(() => format(0));

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(format(value));
      return;
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(format(Math.round(latest))),
    });
    return () => controls.stop();
  }, [inView, value, reduceMotion, duration, format, motionValue]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
