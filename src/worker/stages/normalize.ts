import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const REMOVEBG_API = "https://api.remove.bg/v1.0/removebg";

/** Map background label → solid hex for remove.bg bg_color param */
function bgHex(background: string): string {
  const key = background.trim().toLowerCase();
  if (key.includes("charcoal") || key.includes("dark") || key.includes("black")) return "#2a2a2a";
  if (key.includes("warm")) return "#f5ede0";
  if (key.includes("marble")) return "#f0efec";
  if (key.includes("gradient")) return "#eef1f6";
  return "#ffffff"; // Studio white default
}

/**
 * Stage 1 — Remove background from source image via remove.bg API.
 * Places the product on a solid studio color matching the chosen background.
 * Returns a URL to the processed image (saved to public/uploads/).
 */
export async function normalizeImage(
  imageUrl: string,
  background: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) {
    console.warn("[normalize] REMOVEBG_API_KEY not set — skipping background removal");
    return imageUrl;
  }

  onProgress?.(10);

  // Read from disk to avoid VPS hairpin NAT
  let imageData: Buffer;
  let contentType: string;
  try {
    const { readFile } = await import("fs/promises");
    const filename = new URL(imageUrl).pathname.split("/").pop()!;
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpeg";
    contentType = ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
    imageData = await readFile(join(process.cwd(), "public", "uploads", filename));
  } catch {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Cannot fetch source image: ${res.status}`);
    imageData = Buffer.from(await res.arrayBuffer());
    contentType = res.headers.get("content-type") ?? "image/jpeg";
  }

  onProgress?.(30);

  const formData = new FormData();
  formData.append("image_file", new Blob([imageData as unknown as ArrayBuffer], { type: contentType }), "image.jpg");
  formData.append("size", "auto");
  formData.append("bg_color", bgHex(background));
  formData.append("format", "jpg");

  const res = await fetch(REMOVEBG_API, {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`remove.bg API → ${res.status}: ${text}`);
  }

  onProgress?.(80);

  const resultBuffer = Buffer.from(await res.arrayBuffer());
  const outFilename = `normalized-${randomUUID()}.jpg`;
  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(join(uploadsDir, outFilename), resultBuffer);

  const APP_URL = (process.env.NEXT_PUBLIC_SHARE_URL ?? "https://orbittify.com").replace(/\/$/, "");
  const normalizedUrl = `${APP_URL}/api/uploads/${outFilename}`;

  onProgress?.(100);
  return normalizedUrl;
}
