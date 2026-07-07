import { cn } from "@/lib/utils";

/**
 * Blue → violet gradient hairline border, masked to a 1px ring (padding-box /
 * border-box `mask-composite:exclude`, the same technique as the `gradient-ring`
 * utility and the hero frame). Shared across the premium surfaces — pricing
 * cards, feature cells, testimonial quotes, FAQ items — so every hover/emphasis
 * state speaks the same brand language instead of a flat grey ring.
 *
 * Drop it as a child of any `relative rounded-*` element and drive its opacity
 * with the parent's hover/open state (e.g. `group-hover:opacity-100`).
 */
export function GradientBorder({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={{
        padding: "1px",
        background:
          "linear-gradient(150deg, color-mix(in oklch, #5B8CFF 75%, transparent), color-mix(in oklch, #ffffff 8%, transparent) 42%, transparent 58%, color-mix(in oklch, #8B5CF6 75%, transparent))",
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  );
}
