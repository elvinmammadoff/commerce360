import { generateOrbitVideo } from "../higgsfield";
import { orbitPrompt, type Category } from "../presets";

export interface OrbitVideoResult {
  url: string;
  /** Local file path when video is saved to disk (skips HTTP for ffmpeg). */
  localPath?: string;
  requestId: string;
  width: number;
  height: number;
}

/**
 * Stage 2 — Render orbit video via Higgsfield DoP.
 *
 * Single-segment approach: one DoP call with a carefully crafted prompt.
 * Multi-segment stitch was trialled but produces worse results — DoP
 * hallucinates camera rigs when fed mid-orbit frames from products with
 * visible wires or unusual angles.
 */
export async function renderOrbit360(
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
