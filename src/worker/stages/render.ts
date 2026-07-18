import { generateOrbitVideo } from "../higgsfield";
import { orbitPrompt, type Category } from "../presets";

export interface OrbitVideoResult {
  url: string;
  requestId: string;
  /** Source dimensions needed by the upscaler. Default 1280×720 if unknown. */
  width: number;
  height: number;
}

/**
 * Stage 2 — Render orbit video.
 * Sends the normalized product image to Higgsfield's DoP model with a prompt
 * framed for the detected category (camera elevation + arc) and chosen
 * background. Returns the video URL and its request_id — the ID is required
 * by the upscaler (it references the completed job, not the URL).
 */
export async function renderOrbitVideo(
  normalizedImageUrl: string,
  category: Category,
  background: string,
  onProgress?: (pct: number) => void,
): Promise<OrbitVideoResult> {
  const { url, requestId } = await generateOrbitVideo(
    normalizedImageUrl,
    orbitPrompt(category, background),
    onProgress,
  );
  return { url, requestId, width: 1280, height: 720 };
}
