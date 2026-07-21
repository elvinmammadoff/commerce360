import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import Replicate from "replicate";
import sharp from "sharp";
import JSZip from "jszip";
import { workerFetch } from "../api";

// ---------------------------------------------------------------------------
// Platform definitions
// ---------------------------------------------------------------------------

interface PlatformSpec {
  id: string;
  label: string;
  folder: string;
  prefix: string;
  width: number;
  height: number;
  /** Main-image fill requirement (0–1). Amazon requires ≥0.85. */
  minFill: number;
}

const PLATFORMS: PlatformSpec[] = [
  { id: "amazon",       label: "Amazon",       folder: "amazon",       prefix: "amazon",     width: 2000, height: 2000, minFill: 0.85 },
  { id: "shopify",      label: "Shopify",      folder: "shopify",      prefix: "shopify",    width: 2048, height: 2048, minFill: 0.75 },
  { id: "etsy",         label: "Etsy",         folder: "etsy",         prefix: "listing",    width: 2000, height: 2000, minFill: 0.75 },
  { id: "wayfair",      label: "Wayfair",      folder: "wayfair",      prefix: "wayfair",    width: 2500, height: 2500, minFill: 0.80 },
  { id: "trendyol",     label: "Trendyol",     folder: "trendyol",     prefix: "gorsel",     width: 1000, height: 1000, minFill: 0.80 },
  { id: "hepsiburada",  label: "Hepsiburada",  folder: "hepsiburada",  prefix: "fotograf",   width: 1200, height: 1200, minFill: 0.80 },
];

// ---------------------------------------------------------------------------
// Compliance checks (rule-based, pluggable later with Vision AI)
// ---------------------------------------------------------------------------

export interface ComplianceResult {
  score: number;
  checks: {
    id: string;
    name: string;
    pass: boolean;
    value?: string;
    weight: number;
    recommendation?: string;
  }[];
}

async function analyzeImage(
  buffer: Buffer,
  spec: PlatformSpec,
): Promise<ComplianceResult> {
  // Downsample for pixel analysis (fast, ~200×200)
  const sample = 200;
  const { data, info } = await sharp(buffer)
    .resize(sample, sample, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = info.width * info.height;
  const channels = info.channels; // 3 = RGB
  let nonWhite = 0;
  let sumX = 0, sumY = 0;
  let clipped = false;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const isWhite = r > 245 && g > 245 && b > 245;
      if (!isWhite) {
        nonWhite++;
        sumX += x;
        sumY += y;
        // Edge clip check — product pixel within 2px of border
        if (x <= 2 || x >= info.width - 3 || y <= 2 || y >= info.height - 3) {
          clipped = true;
        }
      }
    }
  }

  const fillPct = nonWhite / pixels;
  const centerX = nonWhite > 0 ? sumX / nonWhite : sample / 2;
  const centerY = nonWhite > 0 ? sumY / nonWhite : sample / 2;
  const dX = Math.abs(centerX - sample / 2) / (sample / 2);
  const dY = Math.abs(centerY - sample / 2) / (sample / 2);
  const centered = dX < 0.12 && dY < 0.12;

  // Sharpness via Laplacian standard deviation
  const { channels: lapChans } = await sharp(buffer)
    .greyscale()
    .convolve({ width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0] })
    .stats();
  const sharpnessStdev = lapChans[0].stdev;
  const sharp_pass = sharpnessStdev > 6;

  const fillOk = fillPct >= spec.minFill;
  const fillPctStr = `${Math.round(fillPct * 100)}%`;

  const checks = [
    {
      id: "background",
      name: "White background",
      pass: true, // guaranteed — we composite on white
      weight: 20,
    },
    {
      id: "resolution",
      name: `Resolution ${spec.width}×${spec.height}`,
      pass: true, // guaranteed — we resize explicitly
      weight: 10,
    },
    {
      id: "format",
      name: "JPEG format",
      pass: true, // guaranteed
      weight: 10,
    },
    {
      id: "fill",
      name: `Product fill ≥${Math.round(spec.minFill * 100)}%`,
      pass: fillOk,
      value: fillPctStr,
      weight: 25,
      recommendation: fillOk ? undefined : `Product occupies only ${fillPctStr} — increase product size in source photo`,
    },
    {
      id: "centered",
      name: "Product centered",
      pass: centered,
      weight: 15,
      recommendation: centered ? undefined : "Product is off-center — retake photo with product centered",
    },
    {
      id: "sharpness",
      name: "Sharp image",
      pass: sharp_pass,
      weight: 15,
      recommendation: sharp_pass ? undefined : "Image appears slightly blurry — use sharper source photo",
    },
    {
      id: "clipping",
      name: "No clipping",
      pass: !clipped,
      weight: 5,
      recommendation: clipped ? "Product is partially cut off at frame edges" : undefined,
    },
  ];

  const score = Math.round(
    checks.reduce((sum, c) => sum + (c.pass ? c.weight : 0), 0),
  );

  return { score, checks };
}

// ---------------------------------------------------------------------------
// BiRefNet background removal (same helper as clean.ts)
// ---------------------------------------------------------------------------

const BG_MODEL = "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

async function removeBackground(
  frameBuffer: Buffer,
  replicate: Replicate,
): Promise<Buffer> {
  const base64 = frameBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64}`;

  let lastErr!: Error;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const output = await replicate.run(
        BG_MODEL as `${string}/${string}:${string}`,
        { input: { image: dataUrl } },
      ) as unknown as string;
      const res = await fetch(output);
      if (!res.ok) throw new Error(`BG removal download: ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err as Error;
      if (lastErr.message?.includes("429") && attempt < 2) {
        const match = lastErr.message.match(/"retry_after":(\d+)/);
        await new Promise((r) => setTimeout(r, (match ? +match[1] : 15) * 1000));
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export interface MarketplaceResult {
  zipPath: string;
  complianceByPlatform: Record<string, ComplianceResult>;
  overallScore: number;
}

/**
 * Generate the marketplace asset set from the 72 extracted orbit frames.
 *
 * Selects 8 frames at 45° intervals, removes backgrounds via BiRefNet,
 * composites on pure white, resizes to each platform's spec, generates
 * a rule-based compliance report, and saves a ZIP to disk.
 *
 * Runs AFTER packaging so the product is already marked "completed" —
 * the user can view their orbit video while this runs in the background.
 */
export async function generateMarketplaceSet(
  productId: string,
  frameCount: number,
  onProgress?: (pct: number) => void,
): Promise<MarketplaceResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) throw new Error("REPLICATE_API_TOKEN not set");

  const replicate = new Replicate({ auth: apiToken });

  const framesDir = join(process.cwd(), "public", "uploads", "frames", productId);
  const allFrames = await readdir(framesDir)
    .then((f) => f.filter((n) => n.startsWith("frame_") && n.endsWith(".jpg")).sort());

  if (allFrames.length === 0) throw new Error("No extracted frames found");

  // Select 8 evenly-spaced frames. For 72 frames = 360°, step = 9 frames = 45°.
  const step = Math.max(1, Math.round(allFrames.length / 8));
  const selectedIndices = Array.from({ length: 8 }, (_, i) =>
    Math.min(i * step, allFrames.length - 1),
  );
  const selectedFrames = selectedIndices.map((i) => allFrames[i]);

  onProgress?.(5);

  // Remove background from each selected frame (sequential with 11s gap to respect rate limit)
  const transparentBuffers: Buffer[] = [];
  for (let i = 0; i < selectedFrames.length; i++) {
    const framePath = join(framesDir, selectedFrames[i]);
    const frameBuffer = await readFile(framePath);
    const t0 = Date.now();
    const transparent = await removeBackground(frameBuffer, replicate);
    transparentBuffers.push(transparent);
    onProgress?.(5 + Math.round(((i + 1) / selectedFrames.length) * 50));
    if (i < selectedFrames.length - 1) {
      const gap = 11_000 - (Date.now() - t0);
      if (gap > 0) await new Promise((r) => setTimeout(r, gap));
    }
  }

  // Build per-platform images and run compliance checks
  const zip = new JSZip();
  const complianceByPlatform: Record<string, ComplianceResult> = {};
  const complianceReports: Record<string, object> = {};

  for (const platform of PLATFORMS) {
    const folder = zip.folder(platform.folder)!;

    for (let i = 0; i < transparentBuffers.length; i++) {
      // Composite on pure white, fit product inside platform dimensions with padding
      const processed = await sharp(transparentBuffers[i])
        .resize(Math.round(platform.width * 0.9), Math.round(platform.height * 0.9), {
          fit: "inside",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .extend({
          top: Math.round(platform.height * 0.05),
          bottom: Math.round(platform.height * 0.05),
          left: Math.round(platform.width * 0.05),
          right: Math.round(platform.width * 0.05),
          background: { r: 255, g: 255, b: 255 },
        })
        .resize(platform.width, platform.height, { fit: "fill" })
        .jpeg({ quality: 95 })
        .toBuffer();

      const filename = i === 0
        ? `${platform.prefix}_main.jpg`
        : `${platform.prefix}_alt${i}.jpg`;
      folder.file(filename, processed);

      // Run compliance only on main image (index 0)
      if (i === 0) {
        complianceByPlatform[platform.id] = await analyzeImage(processed, platform);
        complianceReports[platform.label] = {
          score: complianceByPlatform[platform.id].score,
          dimensions: `${platform.width}×${platform.height}`,
          checks: complianceByPlatform[platform.id].checks.map((c) => ({
            name: c.name,
            status: c.pass ? "✓" : "✗",
            value: c.value,
            recommendation: c.recommendation,
          })),
        };
      }
    }

    onProgress?.(55 + Math.round((PLATFORMS.indexOf(platform) / PLATFORMS.length) * 35));
  }

  const overallScore = Math.round(
    Object.values(complianceByPlatform).reduce((s, r) => s + r.score, 0) /
    PLATFORMS.length,
  );

  const compliance = {
    generatedAt: new Date().toISOString(),
    overallScore,
    platforms: complianceReports,
  };
  zip.file("compliance.json", JSON.stringify(compliance, null, 2));

  // Save ZIP to disk
  const outDir = join(process.cwd(), "public", "uploads", "marketplace", productId);
  await mkdir(outDir, { recursive: true });
  const zipBuffer = Buffer.from(
    await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } }),
  );
  const zipPath = join(outDir, "marketplace-set.zip");
  await writeFile(zipPath, zipBuffer);

  onProgress?.(100);

  return { zipPath, complianceByPlatform, overallScore };
}

/**
 * Patch the product's assets with marketplace compliance data.
 * Fetches existing assets first and merges — PATCH replaces the entire JSON
 * column, so we must preserve frameCount, frameUrls, modelUrl, etc.
 */
export async function patchProductMarketplace(
  productId: string,
  result: MarketplaceResult,
): Promise<void> {
  const complianceScores: Record<string, number> = {};
  for (const [platformId, c] of Object.entries(result.complianceByPlatform)) {
    complianceScores[platformId] = c.score;
  }

  let existingAssets: Record<string, unknown> = {};
  try {
    const existing = await workerFetch(`/api/products/${productId}`);
    if (existing.ok) {
      const data = await existing.json() as { assets?: Record<string, unknown> };
      existingAssets = data.assets ?? {};
    }
  } catch {
    console.warn(`[marketplace] could not fetch existing assets for ${productId}`);
  }

  const res = await workerFetch(`/api/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({
      assets: {
        ...existingAssets,
        marketplaceReady: true,
        marketplaceScore: result.overallScore,
        marketplaceScores: complianceScores,
      },
    }),
  });
  if (!res.ok) console.warn(`[marketplace] patch product failed: ${res.status}`);
}
