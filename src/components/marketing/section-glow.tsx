import { cn } from "@/lib/utils";

/**
 * Ambient section glow — a single large, soft, blurred radial blob that sits
 * *behind* a section's content to add depth and richness without ever competing
 * with the copy. Pure CSS (one radial-gradient + blur), no images, GPU-cheap,
 * and static by default (opt into a slow drift with `drift` — reduced-motion
 * safe via the `aurora` utilities).
 *
 * Usage: drop as an early child of any `relative` section, before its content.
 * It carries no z-index, so later siblings (the actual content) always paint on
 * top — it can never reduce readability. Vary `placement` / `tone` / `size` /
 * `intensity` per section so the page never feels repetitive: some sections get
 * a left glow, others a right glow or a centred bloom.
 *
 *   <section className="relative …">
 *     <SectionGlow placement="right" tone="violet" size="40rem" intensity={0.1} />
 *     …content…
 *   </section>
 */

type GlowTone = "blue" | "indigo" | "violet";
type GlowPlacement =
  | "top-left"
  | "top-right"
  | "top-center"
  | "left"
  | "right"
  | "center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

/** Brand-locked accents — blue (#5B8CFF), indigo mid, violet (#a78bfa). */
const TONES: Record<GlowTone, string> = {
  blue: "91, 140, 255",
  indigo: "124, 108, 255",
  violet: "167, 139, 250",
};

const PLACEMENTS: Record<GlowPlacement, string> = {
  "top-left": "top-0 left-0 -translate-x-1/3 -translate-y-1/3",
  "top-right": "top-0 right-0 translate-x-1/3 -translate-y-1/3",
  "top-center": "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
  left: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
  right: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "bottom-left": "bottom-0 left-0 -translate-x-1/3 translate-y-1/3",
  "bottom-right": "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3",
};

export function SectionGlow({
  placement = "top-left",
  tone = "blue",
  /** Peak alpha of the blob — keep inside the 0.05–0.12 ambient band. */
  intensity = 0.09,
  /** Diameter of the blob (CSS length). Larger = softer, more atmospheric. */
  size = "36rem",
  /** Slow ambient drift; disables itself under prefers-reduced-motion. */
  drift = false,
  className,
}: {
  placement?: GlowPlacement;
  tone?: GlowTone;
  intensity?: number;
  size?: string;
  drift?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, rgba(${TONES[tone]}, ${intensity}), transparent 70%)`,
      }}
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl",
        drift && "aurora-slow",
        PLACEMENTS[placement],
        className,
      )}
    />
  );
}
