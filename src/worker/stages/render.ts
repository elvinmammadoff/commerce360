import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdir, mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { generateOrbitVideo } from "../higgsfield";
import { orbitPrompt, orbitContinuationPrompt, type Category } from "../presets";

const execFileAsync = promisify(execFile);

export interface OrbitVideoResult {
  url: string;
  /** Local file path of the stitched video (for ffmpeg to avoid HTTP). */
  localPath?: string;
  requestId: string;
  width: number;
  height: number;
}

/**
 * Stage 2 — Render a single-arc orbit video (legacy / fallback).
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

/**
 * Stage 2 — Render a full 360° orbit by chaining two DoP segments and
 * stitching them with FFmpeg xfade.
 *
 * Segment 1: original image → ~180° clockwise arc.
 * Segment 2: last frame of segment 1 (opposite side) → completes the circle.
 * Output:    xfade-stitched mp4 saved to public/uploads/videos/.
 */
export async function renderOrbit360(
  normalizedImageUrl: string,
  category: Category,
  background: string,
  onProgress?: (pct: number) => void,
): Promise<OrbitVideoResult> {
  const tmpDir = await mkdtemp(join(tmpdir(), "orbit360-"));

  try {
    // — Segment 1 —
    const { url: url1, requestId } = await generateOrbitVideo(
      normalizedImageUrl,
      orbitPrompt(category, background),
      (p) => onProgress?.(Math.round(p * 0.44)),
    );

    const clip1Path = join(tmpDir, "clip1.mp4");
    await downloadFile(url1, clip1Path);

    const dur1 = await probeDuration(clip1Path);

    // Extract last frame of clip1 → starting view for segment 2
    const midFramePath = join(tmpDir, "midframe.jpg");
    await execFileAsync("ffmpeg", [
      "-sseof", "-0.15",
      "-i", clip1Path,
      "-frames:v", "1",
      "-f", "image2",
      midFramePath,
    ]);

    // Persist mid-frame to public/uploads so Higgsfield can fetch it via URL
    const APP_URL = (process.env.NEXT_PUBLIC_SHARE_URL ?? "https://orbittify.com").replace(/\/$/, "");
    const midFilename = `midframe-${randomUUID()}.jpg`;
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, midFilename), await readFile(midFramePath));
    const midFrameUrl = `${APP_URL}/api/uploads/${midFilename}`;

    // — Segment 2 —
    const { url: url2 } = await generateOrbitVideo(
      midFrameUrl,
      orbitContinuationPrompt(category, background),
      (p) => onProgress?.(44 + Math.round(p * 0.44)),
    );

    const clip2Path = join(tmpDir, "clip2.mp4");
    await downloadFile(url2, clip2Path);

    // Stitch clips with a short crossfade at the join point
    const stitchedPath = join(tmpDir, "stitched.mp4");
    const fadeOffset = Math.max(0, dur1 - 0.2).toFixed(3);
    await execFileAsync("ffmpeg", [
      "-i", clip1Path,
      "-i", clip2Path,
      "-filter_complex",
      `[0:v][1:v]xfade=transition=fade:duration=0.2:offset=${fadeOffset}[v]`,
      "-map", "[v]",
      "-c:v", "libx264",
      "-crf", "18",
      "-preset", "fast",
      stitchedPath,
    ]);

    // Persist stitched video to public/uploads/videos/
    const videosDir = join(process.cwd(), "public", "uploads", "videos");
    await mkdir(videosDir, { recursive: true });
    const outFilename = `orbit360-${randomUUID()}.mp4`;
    const outPath = join(videosDir, outFilename);
    await writeFile(outPath, await readFile(stitchedPath));

    onProgress?.(95);

    return {
      url: `${APP_URL}/api/uploads/videos/${outFilename}`,
      localPath: outPath,
      requestId,
      width: 1280,
      height: 720,
    };
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Cannot download ${url}: ${res.status}`);
  await writeFile(destPath, Buffer.from(await res.arrayBuffer()));
}

async function probeDuration(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  const secs = parseFloat(stdout.trim());
  if (isNaN(secs) || secs <= 0) throw new Error(`ffprobe returned invalid duration: "${stdout}"`);
  return secs;
}
