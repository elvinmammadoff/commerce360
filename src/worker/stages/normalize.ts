import { uploadImageFromUrl, generateCleanProductImage } from "../higgsfield";
import { normalizePrompt } from "../presets";

/**
 * Stage 1 — Normalize source image.
 * Uploads the raw product photo to Higgsfield, then uses FLUX.2 Pro Kontext
 * to generate a clean studio-quality image. The background choice tunes the
 * studio surface and lighting. The output URL feeds the orbit render stage.
 */
export async function normalizeImage(
  imageUrl: string,
  background: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const mediaId = await uploadImageFromUrl(imageUrl);
  return generateCleanProductImage(mediaId, normalizePrompt(background), onProgress);
}
