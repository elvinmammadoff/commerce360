import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, rm, readdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execFileAsync = promisify(execFile);

export interface ExtractResult {
  /** Local temp directory containing frame files (caller must delete). */
  framesDir: string;
  /** Sorted frame file names, e.g. ["frame_000.jpg", "frame_001.jpg", ...] */
  frameFiles: string[];
  frameCount: number;
  /** Approximate video duration in seconds (parsed from ffprobe output). */
  durationSeconds: number;
}

/**
 * Stage 4 — Extract 72 frames from the 4K orbit video.
 * Requires `ffmpeg` and `ffprobe` on PATH. If unavailable, throws so the
 * caller can decide whether to skip or fail the job.
 *
 * Frame rate: 72 frames evenly distributed across the video duration
 * (one per 5° of the 360° orbit, matching the ProductAssets.frameCount spec).
 */
export async function extractFrames(videoUrl: string): Promise<ExtractResult> {
  // Probe duration first so we can calculate the correct fps
  const durationSeconds = await probeDuration(videoUrl);
  const targetFps = 72 / durationSeconds;

  const framesDir = await mkdtemp(join(tmpdir(), "orbit-frames-"));
  try {
    const outputPattern = join(framesDir, "frame_%03d.jpg");
    await execFileAsync("ffmpeg", [
      "-i", videoUrl,
      "-vf", `fps=${targetFps.toFixed(6)},scale=-2:2160`,
      "-q:v", "2",
      "-frames:v", "72",
      outputPattern,
    ]);

    const all = await readdir(framesDir);
    const frameFiles = all.filter((f) => f.startsWith("frame_")).sort();
    return { framesDir, frameFiles, frameCount: frameFiles.length, durationSeconds };
  } catch (err) {
    await rm(framesDir, { recursive: true, force: true }).catch(() => {});
    throw err;
  }
}

async function probeDuration(videoUrl: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    videoUrl,
  ]);
  const secs = parseFloat(stdout.trim());
  if (isNaN(secs) || secs <= 0) throw new Error(`ffprobe returned invalid duration: ${stdout}`);
  return secs;
}
