import { Worker, type Job } from "bullmq";
import { connection } from "./redis";
import { patchJob, patchProduct, refundRenderCredit } from "./api";
import { detectCategory } from "./stages/detect";
import { normalizeImage } from "./stages/normalize";
import { renderOrbit360 } from "./stages/render";
import { upscaleOrbitVideo } from "./stages/upscale";
import { saveOrbitVideo } from "./stages/download";
import { cleanVideoBackground } from "./stages/clean";
import { extractFrames } from "./stages/extract";
import { packageAssets } from "./stages/package";
import type { Category } from "./presets";

export interface RenderJobData {
  jobId: string;
  productId: string;
  workspaceId: string;
  imageUrl: string;
  /** Merchant-selected fallback category; overridden by AI detection. */
  category?: Category;
  /** Studio background choice, e.g. "Studio white". */
  background?: string;
}

async function processRenderJob(job: Job<RenderJobData>) {
  const { jobId, productId, workspaceId, imageUrl } = job.data;
  const background = job.data.background ?? "Studio white";

  try {
    // Stage 0: Detect — vision model classifies the product from the photo.
    // The photo is the source of truth; the merchant-picked category is only a
    // fallback when detection is unavailable.
    const detected =
      (await detectCategory(imageUrl)) ?? job.data.category ?? "general";
    await patchProduct(productId, { category: detected });

    // Stage 1: Normalize — remove.bg strips background, places product on studio color.
    // Falls back to original image if remove.bg is unavailable or quota exceeded.
    await patchJob(jobId, { stage: "normalizing", progress: 5 });
    const normalizedUrl = await normalizeImage(imageUrl, background, (pct) =>
      patchJob(jobId, { stage: "normalizing", progress: 5 + Math.round(pct * 0.9) }),
    ).catch((err: Error) => {
      console.warn(`[worker] normalize failed, using original image: ${err.message}`);
      return imageUrl;
    });
    await patchJob(jobId, { stage: "normalizing", progress: 100 });

    // Stage 2: Render — two DoP segments stitched into a full 360° orbit
    await patchJob(jobId, { stage: "rendering", progress: 5 });
    const orbit = await renderOrbit360(normalizedUrl, detected, background, (pct) =>
      patchJob(jobId, { stage: "rendering", progress: 5 + Math.round(pct * 0.9) }),
    );
    await patchJob(jobId, { stage: "rendering", progress: 100 });

    // Stage 3: Save orbit video to VPS disk for same-origin serving.
    // Higgsfield CDN URLs lack CORS headers — storing the video locally lets
    // the browser canvas extract frames and lets a.download work correctly.
    await patchJob(jobId, { stage: "upscaling", progress: 10 });
    const saved = await saveOrbitVideo(orbit.url, productId).catch((err) => {
      console.warn(`[worker] video download to disk failed, using CDN URL: ${(err as Error).message}`);
      return null;
    });
    // Stage 3b: Clean — remove hallucinated studio equipment frame-by-frame.
    // Requires REPLICATE_API_TOKEN; skips gracefully when unset.
    let finalLocalPath = saved?.localPath ?? orbit.localPath;
    let upscaledVideoUrl = saved?.servedUrl ?? orbit.url;

    if (saved?.localPath && process.env.REPLICATE_API_TOKEN) {
      await patchJob(jobId, { stage: "upscaling", progress: 40 });
      const cleaned = await cleanVideoBackground(
        saved.localPath,
        productId,
        background,
      ).catch((err) => {
        console.warn(`[worker] BG clean skipped: ${(err as Error).message}`);
        return null;
      });
      if (cleaned) {
        finalLocalPath = cleaned.localPath;
        upscaledVideoUrl = cleaned.servedUrl;
      }
    }
    await patchJob(jobId, { stage: "upscaling", progress: 100 });

    // Stage 4: Extract — 72 stills at 5° intervals via ffmpeg (optional)
    await patchJob(jobId, { stage: "extracting", progress: 5 });
    const extract = await extractFrames(finalLocalPath ?? upscaledVideoUrl).catch((err) => {
      // ffmpeg not available or extraction failed — log and continue without frames
      console.warn(`[worker] frame extraction skipped: ${(err as Error).message}`);
      return null;
    });
    await patchJob(jobId, { stage: "extracting", progress: 100 });

    // Stage 5: Package — persist asset URLs and mark product completed
    await patchJob(jobId, { stage: "packaging", progress: 5 });
    await packageAssets({ productId, orbit, upscaledVideoUrl, extract });
    await patchJob(jobId, {
      status: "completed",
      stage: "packaging",
      progress: 100,
      completed_at: new Date().toISOString(),
    });

    console.log(`[worker] job ${jobId} completed → product ${productId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[worker] job ${jobId} failed:`, message);

    await patchJob(jobId, { status: "failed", stage: "failed", progress: 0, error: message });
    await patchProduct(productId, { status: "failed" });
    await refundRenderCredit(workspaceId, jobId);

    throw err;
  }
}

const worker = new Worker<RenderJobData>("render-jobs", processRenderJob, {
  connection,
  concurrency: 3,
});

worker.on("completed", (job: { id?: string }) => {
  console.log(`[worker] job ${job.id} completed`);
});

worker.on("failed", (job: { id?: string } | undefined, err: Error) => {
  console.error(`[worker] job ${job?.id} failed:`, err.message);
});

console.log("[worker] orbittify-worker started, waiting for jobs…");
