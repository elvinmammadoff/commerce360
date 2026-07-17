import { Worker, type Job } from "bullmq";
import { connection } from "./redis";
import { patchJob, patchProduct, refundRenderCredit } from "./api";

export interface RenderJobData {
  jobId: string;
  productId: string;
  workspaceId: string;
  imageUrl: string;
}

type StageId =
  | "queued"
  | "normalizing"
  | "rendering"
  | "upscaling"
  | "extracting"
  | "packaging";

async function processRenderJob(job: Job<RenderJobData>) {
  const { jobId, productId, workspaceId } = job.data;

  try {
    // Stage 1: Normalize image (Flux 2 via Higgsfield)
    await patchJob(jobId, { stage: "normalizing", progress: 5 });
    // TODO: await normalizeImage(imageUrl)
    await patchJob(jobId, { stage: "normalizing", progress: 100 });

    // Stage 2: Orbit video render (Seedance 1.0 via Higgsfield)
    await patchJob(jobId, { stage: "rendering", progress: 5 });
    // TODO: await renderOrbitVideo(normalizedUrl)
    await patchJob(jobId, { stage: "rendering", progress: 100 });

    // Stage 3: 4K upscale (SeeDVR via Higgsfield)
    await patchJob(jobId, { stage: "upscaling", progress: 5 });
    // TODO: await upscaleVideo(orbitVideoUrl)
    await patchJob(jobId, { stage: "upscaling", progress: 100 });

    // Stage 4: Extract 72 frames
    await patchJob(jobId, { stage: "extracting", progress: 5 });
    // TODO: await extractFrames(upscaledVideoUrl)
    await patchJob(jobId, { stage: "extracting", progress: 100 });

    // Stage 5: Package + upload to storage
    await patchJob(jobId, { stage: "packaging", progress: 5 });
    // TODO: await packageAssets({ productId, frames, video })
    await patchJob(jobId, { stage: "packaging", progress: 100 });

    const completedAt = new Date().toISOString();
    await patchProduct(productId, { status: "completed", completed_at: completedAt });
    await patchJob(jobId, { stage: "packaging", progress: 100, completed_at: completedAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

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

console.log("[worker] c360-worker started, waiting for jobs…");
