import { upscaleVideoTo4K } from "../higgsfield";
import type { OrbitVideoResult } from "./render";

/**
 * Stage 3 — Upscale to 4K.
 * Passes the completed orbit video job to Higgsfield's ByteDance upscaler.
 * Returns the CDN URL of the 4K video used for the 360° viewer and frame extraction.
 */
export async function upscaleOrbitVideo(
  orbit: OrbitVideoResult,
  onProgress?: (pct: number) => void,
): Promise<string> {
  return upscaleVideoTo4K(orbit.requestId, orbit.width, orbit.height, onProgress);
}
