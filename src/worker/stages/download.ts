import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

export interface SavedVideo {
  /** Absolute path on disk — safe for ffmpeg. */
  localPath: string;
  /** Same-origin URL to store in the database. */
  servedUrl: string;
}

/**
 * Download a Higgsfield CDN video to the VPS public directory so that
 * browsers can load it same-origin (required for canvas frame extraction).
 */
export async function saveOrbitVideo(
  cdnUrl: string,
  productId: string,
): Promise<SavedVideo> {
  const dir = join(process.cwd(), "public", "uploads", "videos");
  await mkdir(dir, { recursive: true });

  const localPath = join(dir, `${productId}.mp4`);

  const res = await fetch(cdnUrl);
  if (!res.ok) throw new Error(`saveOrbitVideo fetch failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(localPath, buffer);

  const APP_URL = (process.env.NEXT_PUBLIC_SHARE_URL ?? "https://orbittify.com").replace(/\/$/, "");
  const servedUrl = `${APP_URL}/api/uploads/videos/${productId}.mp4`;

  return { localPath, servedUrl };
}
