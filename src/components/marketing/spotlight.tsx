"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Cursor-tracked spotlight for premium cards.
 *
 * Drop this as the first child of any `relative isolate group` card. It finds
 * its parent, writes the pointer position to `--spot-x` / `--spot-y` CSS
 * variables directly on the DOM node (no React state, so pointermove never
 * triggers a re-render), and renders a soft brand light that lives *behind* the
 * card content — keeping text perfectly legible. Reveal is driven by the
 * parent's hover state via the passed-in group utility classes.
 */
export function Spotlight({ className }: { className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    // Coarse pointers (touch) get no spotlight — it's a hover-only affordance.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      });
    };

    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span ref={ref} aria-hidden="true" className={cn("spotlight-layer", className)} />
  );
}
