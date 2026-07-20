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
 * Copy a frame file into public/uploads/frames/{productId}/ and return its URL.
 * Avoids the need for a Laravel /api/assets/frames endpoint.
 */
async function uploadFrame(
  productId: string,
  framesDir: string,
  filename: string,
): Promise<string> {
  const { readFile, writeFile, mkdir } = await import("fs/promises");
  const { join } = await import("path");

  const buffer = await readFile(`${framesDir}/${filename}`);
  const destDir = join(process.cwd(), "public", "uploads", "frames", productId);
  await mkdir(destDir, { recursive: true });
  await writeFile(join(destDir, filename), buffer);

  const APP_URL = (process.env.NEXT_PUBLIC_SHARE_URL ?? "https://orbittify.com").replace(/\/$/, "");
  return `${APP_URL}/api/uploads/frames/${productId}/${filename}`;
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
      credits_used: 1,
      assets,
    }),
  });
  if (!res.ok) throw new Error(`patchProduct assets → ${res.status}`);
}
