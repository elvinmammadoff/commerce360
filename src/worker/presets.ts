/**
 * Category → camera framing and background → lighting maps.
 *
 * The detected product category drives the orbit camera (elevation + arc) so
 * a chair is shot at eye level while a table is shot angled down. Background
 * choice drives the studio lighting/surface described to both the normalize
 * and render prompts.
 */

export type Category =
  | "seating"
  | "sofas"
  | "beds"
  | "tables"
  | "lighting"
  | "storage";

/** Per-category camera framing fragment injected into the orbit prompt. */
const CAMERA: Record<Category, string> = {
  seating:
    "camera at seat eye-level, wide 360-degree arc, subject centered, full chair in frame",
  sofas:
    "camera slightly above seat height, wide sweeping 360-degree arc, entire sofa in frame",
  beds:
    "camera elevated 30 degrees above, wide slow 360-degree arc, headboard and top surface clearly visible",
  tables:
    "camera 35 degrees above looking down, wide 360-degree arc, tabletop surface and legs visible",
  lighting:
    "low camera angle emphasizing the silhouette and shade, slow even 360-degree rotation",
  storage:
    "camera at mid-height eye-level, wide 360-degree arc, doors and front face clearly visible",
};

/** Background label → studio surface + lighting fragment. */
function backgroundFragment(background: string): string {
  const key = background.trim().toLowerCase();
  if (key.includes("warm"))
    return "warm off-white studio backdrop, soft golden key light";
  if (key.includes("gradient"))
    return "soft neutral gradient studio backdrop, smooth diffused lighting";
  if (key.includes("marble"))
    return "polished white marble surface with subtle grey veining, soft studio lighting";
  if (key.includes("charcoal") || key.includes("dark") || key.includes("black"))
    return "dark charcoal studio backdrop, dramatic low-key lighting with soft rim light";
  // Default: studio white
  return "pure white studio background, soft even shadowless lighting";
}

/** Prompt for the FLUX normalize stage (clean studio product image). */
export function normalizePrompt(background: string): string {
  return `Professional product photography, ${backgroundFragment(
    background,
  )}, centered subject, no reflections, no distractions`;
}

/** Prompt for the orbit render stage, framed for the detected category. */
export function orbitPrompt(category: Category, background: string): string {
  return `Smooth seamless 360-degree orbit around the product, ${CAMERA[category]}, ${backgroundFragment(
    background,
  )}, cinematic lighting, slow even rotation`;
}
