/**
 * Ambient page atmosphere for the marketing surface.
 *
 * A single fixed, layered light field that sits behind all content so the whole
 * page reads as one continuously-lit space instead of a stack of flat panels.
 * Light falls from the top (brand-blue, with a faint violet counter-light),
 * grain kills gradient banding, and a slow aurora keeps it alive without ever
 * competing with the copy. Scoped to the marketing layout only — the product
 * app keeps its own restrained chrome.
 *
 * Pure CSS, no JS, GPU-cheap: one drifting transform, disabled under
 * prefers-reduced-motion via the `aurora` utilities.
 */
export function Atmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base wash — a soft top-down light that grounds the near-black canvas. */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_720px_at_50%_-10%,rgba(91,140,255,0.10),transparent_60%)]" />

      {/* Brand key light, upper-left. */}
      <div className="aurora absolute -top-40 -left-32 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(91,140,255,0.16),transparent_62%)] blur-2xl" />

      {/* Faint violet counter-light, upper-right — adds temperature depth. */}
      <div className="aurora-slow absolute -top-32 right-[-10rem] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.10),transparent_64%)] blur-2xl" />

      {/* Edge vignette — pulls light off the corners so content sits forward. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,rgba(0,0,0,0.55))]" />

      {/* Sensor grain — the last 3% that reads as photographic, not rendered. */}
      <div className="bg-noise absolute inset-0 opacity-[0.035] mix-blend-soft-light" />
    </div>
  );
}
