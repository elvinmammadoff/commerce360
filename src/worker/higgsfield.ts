/**
 * Higgsfield AI REST client for the Orbittify pipeline worker.
 *
 * Base URL: https://platform.higgsfield.ai
 * Auth:     Authorization: Key KEY_ID:KEY_SECRET
 *
 * Required env: HF_CREDENTIALS="your_key_id:your_key_secret"
 * Obtain credentials at: https://cloud.higgsfield.ai → API Keys
 */

const HF_BASE = "https://platform.higgsfield.ai";

type HfJob = {
  request_id?: string;
  id?: string;
  status?: string;
  images?: { url: string }[];
  video?: { url: string };
  // upload endpoint shape
  upload_url?: string;
  media_id?: string;
};

function authHeader(): string {
  return `Key ${process.env.HF_CREDENTIALS ?? ""}`;
}

async function hfPost(path: string, body: unknown): Promise<HfJob> {
  const res = await fetch(`${HF_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Higgsfield POST ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function hfGet(path: string): Promise<HfJob> {
  const res = await fetch(`${HF_BASE}${path}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) {
    throw new Error(`Higgsfield GET ${path} → ${res.status}`);
  }
  return res.json();
}

/**
 * Poll a job until completed. Calls onProgress(0-95) while waiting.
 * Throws on failure, NSFW rejection, or timeout.
 */
export async function poll(
  requestId: string,
  onProgress?: (pct: number) => void,
  timeoutMs = 720_000,
): Promise<HfJob> {
  const deadline = Date.now() + timeoutMs;
  let tick = 0;
  while (Date.now() < deadline) {
    await new Promise<void>((r) => setTimeout(r, 5_000));
    const data = await hfGet(`/requests/${requestId}/status`);
    if (data.status === "completed") return data;
    if (data.status === "failed" || data.status === "nsfw") {
      throw new Error(`Higgsfield job ${requestId} ended with: ${data.status}`);
    }
    tick++;
    if (onProgress) {
      // Log-curve estimate: approaches 95% asymptotically while in_progress
      const pct = Math.min(95, Math.round((1 - Math.exp(-tick * 0.04)) * 100));
      onProgress(pct);
    }
  }
  throw new Error(`Higgsfield job ${requestId} timed out after ${timeoutMs}ms`);
}

/**
 * Download an image from a public URL and upload it to Higgsfield.
 * Returns the Higgsfield media_id for use as a generation reference.
 */
export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Cannot fetch source image: ${imgRes.status}`);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";

  const { upload_url, media_id } = (await hfPost("/files/generate-upload-url", {
    content_type: contentType,
  })) as { upload_url: string; media_id: string };

  const putRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: buffer,
  });
  if (!putRes.ok) throw new Error(`Higgsfield S3 upload failed: ${putRes.status}`);

  return media_id;
}

/**
 * Generate a clean studio product image using FLUX.2 Pro Kontext.
 * Accepts the Higgsfield media_id of the source image.
 * Returns the output image URL hosted on Higgsfield CDN.
 */
export async function generateCleanProductImage(
  mediaId: string,
  prompt: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const job = await hfPost("flux-pro/kontext/max/text-to-image", {
    prompt,
    aspect_ratio: "1:1",
    resolution: "2k",
    medias: [{ value: mediaId, role: "image_references" }],
  });
  const requestId = job.request_id ?? job.id!;
  const done = await poll(requestId, onProgress);
  const url = done.images?.[0]?.url;
  if (!url) throw new Error(`FLUX.2 returned no image URL for job ${requestId}`);
  return url;
}

/**
 * Generate a 360° orbit video from a product image URL.
 * Uses the Higgsfield DoP (Director of Photography) turbo model.
 * Returns the completed video URL and its Higgsfield request_id (needed for upscaling).
 */
export async function generateOrbitVideo(
  imageUrl: string,
  prompt: string,
  onProgress?: (pct: number) => void,
): Promise<{ url: string; requestId: string }> {
  const job = await hfPost("/v1/image2video/dop", {
    model: "dop-turbo",
    prompt,
    input_images: [{ type: "image_url", image_url: imageUrl }],
  });
  const requestId = job.request_id ?? job.id!;
  const done = await poll(requestId, onProgress, 900_000);
  const url = done.video?.url;
  if (!url) throw new Error(`Orbit video returned no URL for job ${requestId}`);
  return { url, requestId };
}

/**
 * Upscale a completed Higgsfield video job to 4K using the ByteDance upscaler.
 * Pass the request_id of the completed orbit video generation, not the URL.
 *
 * NOTE: Verify /v1/upscale/video endpoint path against https://docs.higgsfield.ai
 */
export async function upscaleVideoTo4K(
  videoRequestId: string,
  sourceWidth: number,
  sourceHeight: number,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const job = await hfPost("/v1/upscale/video", {
    provider: "bytedance",
    video_id: videoRequestId,
    width: sourceWidth,
    height: sourceHeight,
    resolution: "4k",
    preset: "aigc",
    fps: 24,
  });
  const requestId = job.request_id ?? job.id!;
  const done = await poll(requestId, onProgress, 900_000);
  const url = done.video?.url;
  if (!url) throw new Error(`Video upscale returned no URL for job ${requestId}`);
  return url;
}
