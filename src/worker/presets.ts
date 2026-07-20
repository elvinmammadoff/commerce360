/**
 * Category → camera framing and background → lighting maps.
 */

export type Category =
  | "accessories"
  | "electronics"
  | "fashion"
  | "footwear"
  | "furniture"
  | "food_beverage"
  | "general";

/**
 * Per-category camera framing fragment.
 * All descriptions assume the product sits on a flat surface — even if the
 * source photo shows it hanging. The orbit is always horizontal.
 */
const CAMERA: Record<Category, string> = {
  accessories:
    "camera positioned at product mid-height, moves in a tight horizontal circle around the product",
  electronics:
    "camera positioned slightly above center, moves in a clean horizontal circle showing all panel faces",
  fashion:
    "camera at product center-height, moves in a wide horizontal arc revealing front, sides, and back",
  footwear:
    "camera at shoe-height (low, just above surface level), moves in a tight horizontal circle around the shoe — side profile, toe, heel, and opposite side all visible",
  furniture:
    "camera at eye-level mid-height, moves in a wide horizontal circle showing all faces and angles of the piece",
  food_beverage:
    "camera at label-height, moves in a tight horizontal circle keeping the label front visible, front and back panels shown",
  general:
    "camera at product center-height, moves in a smooth horizontal circle around the product showing all sides",
};

/** Background label → studio surface + lighting fragment. */
function backgroundFragment(background: string): string {
  const key = background.trim().toLowerCase();
  if (key.includes("warm"))
    return "warm off-white studio surface, soft golden key light from upper-left";
  if (key.includes("gradient"))
    return "soft neutral gradient studio surface, smooth diffused lighting from above";
  if (key.includes("marble"))
    return "polished white marble surface with subtle grey veining, soft studio lighting";
  if (key.includes("charcoal") || key.includes("dark") || key.includes("black"))
    return "dark charcoal studio surface, dramatic low-key lighting with soft rim light";
  return "pure white studio surface, soft even shadowless lighting from above";
}

/** Prompt for the FLUX normalize stage (clean studio product image). */
export function normalizePrompt(background: string): string {
  return `Remove the background from this product photograph. Keep the product itself completely unchanged — same exact shape, colors, labels, text, and every detail must be identical to the original. Only replace the background with: ${backgroundFragment(background)}. Do not alter, recreate, or reimagine the product in any way. The product must look exactly as in the original photo.`;
}

/**
 * Prompt for the orbit render stage.
 *
 * Key constraints enforced:
 * - Camera moves in the HORIZONTAL plane only (no vertical arc, no tilt)
 * - Product is on a flat surface — DoP must not treat it as hanging
 * - No wires, rigs, or studio equipment
 * - Product appearance unchanged from source image
 */
export function orbitPrompt(category: Category, background: string): string {
  return [
    "Professional product photography. Smooth camera orbit.",
    "The product sits on a flat studio surface and is completely stationary.",
    "CAMERA MOVEMENT: the camera travels in a complete 360-degree horizontal circle around the product at constant height — like a turntable viewed from the side. The orbit must be a full revolution, starting and ending at the same front-facing angle.",
    "The camera moves strictly in the horizontal plane. No vertical movement. No camera tilt. No zoom. Constant focal length. Constant height. Full 360-degree coverage is mandatory.",
    CAMERA[category] + ".",
    backgroundFragment(background) + ".",
    "The product appears exactly as in the source image — identical shape, colors, labels, texture, and all details. Do not alter, open, or reimagine the product.",
    "STRICTLY FORBIDDEN: wires, strings, suspension cables, hanging apparatus, camera rigs, mounting hardware, tripods, studio clamps, ball-head mounts, any equipment.",
    "STRICTLY FORBIDDEN: plants, flowers, props, decorative objects, people, text overlays, edge artifacts, shadow bleeding.",
    "Nothing in the frame except the product and the studio background.",
  ].join(" ");
}

/**
 * Prompt for the second orbit segment — continues the arc from the current mid-angle view.
 * Used only in multi-segment stitch mode.
 */
export function orbitContinuationPrompt(category: Category, background: string): string {
  return [
    "Professional product photography. Smooth camera orbit continues.",
    "The product shown in this image sits on a flat studio surface and is completely stationary.",
    "CAMERA MOVEMENT: the camera continues traveling clockwise in a horizontal circle at constant height, completing the orbit back to the front-facing view.",
    "The camera moves strictly in the horizontal plane. No vertical movement. No camera tilt. No zoom. Constant focal length. Constant height.",
    CAMERA[category] + ".",
    backgroundFragment(background) + ".",
    "Product appearance is identical to the source — same shape, colors, labels, texture. Do not alter or reimagine.",
    "STRICTLY FORBIDDEN: wires, strings, suspension cables, hanging apparatus, camera rigs, mounting hardware, tripods, studio clamps, ball-head mounts, any equipment.",
    "STRICTLY FORBIDDEN: plants, flowers, props, decorative objects, people, text overlays, edge artifacts.",
    "Nothing in the frame except the product and the studio background.",
  ].join(" ");
}
