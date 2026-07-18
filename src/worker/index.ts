import { Worker, type Job } from "bullmq";
import { connection } from "./redis";
import { patchJob, patchProduct, refundRenderCredit } from "./api";
import { detectCategory } from "./stages/detect";
import { normalizeImage } from "./stages/normalize";
import { renderOrbitVideo } from "./stages/render";
import { upscaleOrbitVideo } from "./stages/upscale";
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

    // Stage 1: Normalize — FLUX.2 Pro Kontext cleans the source image
    await patchJob(jobId, { stage: "normalizing", progress: 5 });
    const normalizedUrl = await normalizeImage(imageUrl, background, (pct) =>
      patchJob(jobId, { stage: "normalizing", progress: 5 + Math.round(pct * 0.9) }),
    );
    await patchJob(jobId, { stage: "normalizing", progress: 100 });

    // Stage 2: Render — Higgsfield DoP model generates the 360° orbit video
    await patchJob(jobId, { stage: "rendering", progress: 5 });
    const orbit = await renderOrbitVideo(normalizedUrl, detected, background, (pct) =>
      patchJob(jobId, { stage: "rendering", progress: 5 + Math.round(pct * 0.9) }),
    );
    await patchJob(jobId, { stage: "rendering", progress: 100 });

    // Stage 3: Upscale — ByteDance SeeDVR upscaler enhances to 4K
    await patchJob(jobId, { stage: "upscaling", progress: 5 });
    const upscaledVideoUrl = await upscaleOrbitVideo(orbit, (pct) =>
      patchJob(jobId, { stage: "upscaling", progress: 5 + Math.round(pct * 0.9) }),
    );
    await patchJob(jobId, { stage: "upscaling", progress: 100 });

    // Stage 4: Extract — 72 stills at 5° intervals via ffmpeg (optional)
    await patchJob(jobId, { stage: "extracting", progress: 5 });
    const extract = await extractFrames(upscaledVideoUrl).catch((err) => {
      // ffmpeg not available or extraction failed — log and continue without frames
      console.warn(`[worker] frame extraction skipped: ${(err as Error).message}`);
      return null;
    });
    await patchJob(jobId, { stage: "extracting", progress: 100 });

    // Stage 5: Package — persist asset URLs and mark product completed
    await patchJob(jobId, { stage: "packaging", progress: 5 });
    await packageAssets({ productId, orbit, upscaledVideoUrl, extract });
    await patchJob(jobId, { stage: "packaging", progress: 100 });

    console.log(`[worker] job ${jobId} completed → product ${productId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[worker] job ${jobId} failed:`, message);

    await patchJob(jobId, { stage: "queued", progress: 0, error: message });
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
