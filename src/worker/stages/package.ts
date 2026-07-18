import { rm } from "fs/promises";
import { workerFetch } from "../api";
import type { ExtractResult } from "./extract";
import type { OrbitVideoResult } from "./render";

export interface PackageInput {
  productId: string;
  orbit: OrbitVideoResult;
  upscaledVideoUrl: string;
  extract: ExtractResult | null;
}

/**
 * Approximate file size in MB from a CDN URL by sending a HEAD request.
 * Falls back to 0 if the server doesn't return Content-Length.
 */
async function headSizeMb(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const len = res.headers.get("content-length");
    return len ? Math.round((parseInt(len, 10) / 1_048_576) * 10) / 10 : 0;
  } catch {
    return 0;
  }
}

/**
 * Upload a single frame file to the product's asset storage via the Laravel API.
 * Returns the hosted URL for that frame.
 */
async function uploadFrame(
  productId: string,
  framesDir: string,
  filename: string,
): Promise<string> {
  const { readFile } = await import("fs/promises");
  const buffer = await readFile(`${framesDir}/${filename}`);
  const formData = new FormData();
  formData.append("product_id", productId);
  formData.append("filename", filename);
  formData.append("file", new Blob([buffer], { type: "image/jpeg" }), filename);

  const res = await workerFetch("/api/assets/frames", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Frame upload ${filename} → ${res.status}`);
  const { url } = (await res.json()) as { url: string };
  return url;
}

/**
 * Stage 5 — Package and persist assets.
 * Stores the orbit video URL, uploads extracted frames if available,
 * and patches the product record with the full ProductAssets payload.
 */
export async function packageAssets(input: PackageInput): Promise<void> {
  const { productId, orbit, upscaledVideoUrl, extract } = input;

  const videoSizeMb = await headSizeMb(upscaledVideoUrl);
  const frameResolution = 3840; // 4K orbit video → 3840px wide frames
  const frameCount = extract?.frameCount ?? 72;

  const frameUrls: string[] = [];
  if (extract) {
    for (const filename of extract.frameFiles) {
      const url = await uploadFrame(productId, extract.framesDir, filename);
      frameUrls.push(url);
    }
    await rm(extract.framesDir, { recursive: true, force: true }).catch(() => {});
  }

  const completedAt = new Date().toISOString();
  const assets = {
    orbitVideoUrl: upscaledVideoUrl,
    videoResolution: "4K",
    videoDurationSeconds: extract?.durationSeconds ?? 10,
    videoSizeMb: videoSizeMb,
    frameCount: frameCount,
    frameResolution: frameResolution,
    frameUrls: frameUrls,
    packageSizeMb: Math.round((videoSizeMb + (frameCount * 0.3)) * 10) / 10,
    marketplaceSetSizeMb: Math.round(frameCount * 0.3 * 10) / 10,
  };

  const res = await workerFetch(`/api/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "completed",
      completed_at: completedAt,
      assets,
    }),
  });
  if (!res.ok) throw new Error(`patchProduct assets → ${res.status}`);
}
