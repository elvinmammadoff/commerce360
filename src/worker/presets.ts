/**
 * Category → camera framing and background → lighting maps.
 *
 * The detected product category drives the orbit camera (elevation + arc) so
 * a chair is shot at eye level while a table is shot angled down. Background
 * choice drives the studio lighting/surface described to both the normalize
 * and render prompts.
 */

export type Category =
  | "accessories"
  | "electronics"
  | "fashion"
  | "furniture"
  | "food_beverage"
  | "general";

/** Per-category camera framing fragment injected into the orbit prompt. */
const CAMERA: Record<Category, string> = {
  accessories:
    "camera at product mid-height, tight 360-degree orbit, subject fills frame, fine detail visible",
  electronics:
    "camera elevated 20 degrees above, clean tight 360-degree arc, product centered, all sides visible",
  fashion:
    "camera at product mid-height, wide 360-degree arc, full garment or item visible",
  furniture:
    "camera at mid-height eye-level, wide sweeping 360-degree arc, entire piece in frame",
  food_beverage:
    "camera at label-height, tight 360-degree rotation, front label and packaging clearly visible",
  general:
    "camera at mid-height, smooth 360-degree orbit, subject centered, full product in frame",
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
  return `Remove the background from this product photograph. Keep the product itself completely unchanged — same exact shape, colors, labels, text, and every detail must be identical to the original. Only replace the background with: ${backgroundFragment(
    background,
  )}. Do not alter, recreate, or reimagine the product in any way. The product must look exactly as in the original photo.`;
}

/** Prompt for the orbit render stage, framed for the detected category. */
export function orbitPrompt(category: Category, background: string): string {
  return `Smooth 360-degree camera orbit around the product. The product remains perfectly stationary. ${CAMERA[category]}. ${backgroundFragment(background)}. Professional product photography lighting, soft diffused light. Constant camera height. Constant focal length. No zoom. No deformation. No morphing. No plants. No flowers. No props. No decorative elements. No people. Nothing except the product and the background. 8-second seamless orbit.`;
}
