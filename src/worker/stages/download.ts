import { execFile } from "child_process";
import { promisify } from "util";
import { mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execFileAsync = promisify(execFile);

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
  const tmpPath = join(tmpdir(), `${productId}-raw.mp4`);

  const res = await fetch(cdnUrl);
  if (!res.ok) throw new Error(`saveOrbitVideo fetch failed: ${res.status}`);
  await writeFile(tmpPath, Buffer.from(await res.arrayBuffer()));

  // Re-encode with -g 1 (all-intra) so video.currentTime scrubbing is instant.
  // Without this browsers must decode from the nearest keyframe on every drag event.
  await execFileAsync("ffmpeg", [
    "-i", tmpPath,
    "-c:v", "libx264",
    "-g", "1",
    "-crf", "22",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-y",
    localPath,
  ]);
  await unlink(tmpPath).catch(() => {});

  const APP_URL = (process.env.NEXT_PUBLIC_SHARE_URL ?? "https://orbittify.com").replace(/\/$/, "");
  const servedUrl = `${APP_URL}/api/uploads/videos/${productId}.mp4`;

  return { localPath, servedUrl };
}
