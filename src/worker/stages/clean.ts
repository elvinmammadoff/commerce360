import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, rm, readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import Replicate from "replicate";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

/** Map background label → RGB for product compositing. */
function bgRgb(background: string): { r: number; g: number; b: number } {
  const key = background.trim().toLowerCase();
  if (key.includes("warm")) return { r: 249, g: 245, b: 238 };
  if (key.includes("dark") || key.includes("charcoal") || key.includes("black"))
    return { r: 42, g: 42, b: 42 };
  if (key.includes("marble")) return { r: 250, g: 250, b: 250 };
  if (key.includes("gradient")) return { r: 240, g: 240, b: 240 };
  return { r: 255, g: 255, b: 255 };
}

async function resolveVersion(replicate: Replicate, owner: string, name: string): Promise<string> {
  const model = await replicate.models.get(owner, name);
  const id = (model as { latest_version?: { id?: string } }).latest_version?.id;
  if (!id) throw new Error(`Cannot resolve ${owner}/${name} latest version`);
  return id;
}

/**
 * Remove background from a single frame via Replicate BiRefNet.
 * Returns a PNG buffer with the product on a solid background.
 */
async function cleanFrame(
  framePath: string,
  color: { r: number; g: number; b: number },
  replicate: Replicate,
  modelRef: string,
): Promise<Buffer> {
  const imageBase64 = (await readFile(framePath)).toString("base64");
  const dataUrl = `data:image/jpeg;base64,${imageBase64}`;

  const output = await replicate.run(modelRef as `${string}/${string}:${string}`, {
    input: { image: dataUrl },
  }) as unknown as string;

  const res = await fetch(output);
  if (!res.ok) throw new Error(`BG removal download failed: ${res.status}`);
  const pngBuffer = Buffer.from(await res.arrayBuffer());

  return sharp(pngBuffer)
    .flatten({ background: color })
    .jpeg({ quality: 92 })
    .toBuffer();
}

export interface CleanVideoResult {
  localPath: string;
  servedUrl: string;
}

/**
 * Stage 3b — Remove hallucinated studio equipment from the orbit video.
 *
 * Higgsfield DoP adds studio lights, tripods and camera rigs to the scene.
 * This stage extracts frames, strips backgrounds via Replicate BiRefNet,
 * composites on a clean solid background, and re-encodes to MP4.
 *
 * Requires REPLICATE_API_TOKEN env var.
 */
export async function cleanVideoBackground(
  inputLocalPath: string,
  productId: string,
  background: string,
): Promise<CleanVideoResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) throw new Error("REPLICATE_API_TOKEN not set");

  const replicate = new Replicate({ auth: apiToken });
  const color = bgRgb(background);

  const workDir = await mkdtemp(join(tmpdir(), `clean-${productId}-`));
  const framesDir = join(workDir, "frames");
  const cleanDir = join(workDir, "clean");

  try {
    await mkdir(framesDir, { recursive: true });
    await mkdir(cleanDir, { recursive: true });

    // Resolve model version once (avoids per-frame API call)
    const versionId = await resolveVersion(replicate, "lucataco", "remove-bg");
    const modelRef = `lucataco/remove-bg:${versionId}`;

    // 1. Extract frames at 12fps (smooth enough for turntable orbit)
    await execFileAsync("ffmpeg", [
      "-i", inputLocalPath,
      "-vf", "fps=12,scale=1280:720",
      "-q:v", "2",
      join(framesDir, "frame_%04d.jpg"),
      "-y",
    ]);

    const frameFiles = (await readdir(framesDir))
      .filter((f) => f.startsWith("frame_") && f.endsWith(".jpg"))
      .sort();

    if (frameFiles.length === 0) throw new Error("No frames extracted from video");

    // 2. Process frames through BiRefNet, 5 concurrent
    const CONCURRENCY = 5;
    for (let i = 0; i < frameFiles.length; i += CONCURRENCY) {
      const batch = frameFiles.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async (file) => {
          const cleaned = await cleanFrame(join(framesDir, file), color, replicate, modelRef);
          await writeFile(join(cleanDir, file), cleaned);
        }),
      );
    }

    // 3. Re-encode to MP4
    const outputPath = join(
      process.cwd(),
      "public",
      "uploads",
      "videos",
      `${productId}-clean.mp4`,
    );
    await execFileAsync("ffmpeg", [
      "-framerate", "12",
      "-i", join(cleanDir, "frame_%04d.jpg"),
      "-c:v", "libx264",
      "-crf", "22",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-y",
      outputPath,
    ]);

    const APP_URL = (process.env.NEXT_PUBLIC_SHARE_URL ?? "https://orbittify.com").replace(/\/$/, "");
    return {
      localPath: outputPath,
      servedUrl: `${APP_URL}/api/uploads/videos/${productId}-clean.mp4`,
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
