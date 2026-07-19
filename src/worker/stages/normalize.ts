import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import Replicate from "replicate";
import sharp from "sharp";

const MODEL_REF = "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

function bgRgb(background: string): { r: number; g: number; b: number } {
  const key = background.trim().toLowerCase();
  if (key.includes("charcoal") || key.includes("dark") || key.includes("black")) return { r: 42, g: 42, b: 42 };
  if (key.includes("warm")) return { r: 245, g: 237, b: 224 };
  if (key.includes("marble")) return { r: 240, g: 239, b: 236 };
  if (key.includes("gradient")) return { r: 238, g: 241, b: 246 };
  return { r: 255, g: 255, b: 255 };
}

/**
 * Stage 1 — Remove background from source image via Replicate 851-labs/background-remover.
 * Places product on solid studio color, saves to public/uploads/, returns served URL.
 */
export async function normalizeImage(
  imageUrl: string,
  background: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    console.warn("[normalize] REPLICATE_API_TOKEN not set — skipping background removal");
    return imageUrl;
  }

  onProgress?.(10);

  const replicate = new Replicate({ auth: apiToken });

  // Read from disk to avoid VPS hairpin NAT; fall back to fetch
  let imageBase64: string;
  let mimeType: string;
  try {
    const filename = new URL(imageUrl).pathname.split("/").pop()!;
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpeg";
    mimeType = ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
    const buf = await readFile(join(process.cwd(), "public", "uploads", filename));
    imageBase64 = buf.toString("base64");
  } catch {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Cannot fetch source image: ${res.status}`);
    mimeType = res.headers.get("content-type") ?? "image/jpeg";
    imageBase64 = Buffer.from(await res.arrayBuffer()).toString("base64");
  }

  onProgress?.(30);

  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  const output = await replicate.run(MODEL_REF as `${string}/${string}:${string}`, {
    input: { image: dataUrl },
  }) as unknown as string;

  onProgress?.(75);

  const res = await fetch(output);
  if (!res.ok) throw new Error(`Replicate output download failed: ${res.status}`);
  const pngBuffer = Buffer.from(await res.arrayBuffer());

  const color = bgRgb(background);
  const jpegBuffer = await sharp(pngBuffer)
    .flatten({ background: color })
    .jpeg({ quality: 92 })
    .toBuffer();

  const outFilename = `normalized-${randomUUID()}.jpg`;
  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(join(uploadsDir, outFilename), jpegBuffer);

  const APP_URL = (process.env.NEXT_PUBLIC_SHARE_URL ?? "https://orbittify.com").replace(/\/$/, "");

  onProgress?.(100);
  return `${APP_URL}/api/uploads/${outFilename}`;
}
