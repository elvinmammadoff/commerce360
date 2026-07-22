import { NextRequest, NextResponse } from "next/server";
import { Queue } from "bullmq";
import Redis from "ioredis";
import type { RenderJobData } from "@/worker/index";
import { uploadImage } from "@/lib/storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";

function getQueue() {
  const connection = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
  });
  return new Queue<RenderJobData>("render-jobs", { connection });
}

async function laravelFetch(path: string, token: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData;
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("c360-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify session is valid
  const userRes = await laravelFetch("/api/user", token);
  if (!userRes.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const name = (formData.get("name") as string | null)?.trim();
  const sku = (formData.get("sku") as string | null)?.trim() || "SKU-TBD";
  const background = (formData.get("background") as string | null) || "Studio white";
  const resolution = (formData.get("resolution") as string | null) || "4K";
  const category = (formData.get("category") as string | null) || "general";
  const include3d = formData.get("include3d") === "true";

  if (!file || !name) {
    return NextResponse.json({ error: "name and file required" }, { status: 400 });
  }

  // 1. Optimize and upload image to Cloudflare R2
  const imageUrl = await uploadImage(file);

  // 2. Create draft product in Laravel
  const productRes = await laravelFetch("/api/products", token, {
    method: "POST",
    body: JSON.stringify({ name, sku, category, source_image_name: file.name }),
  });
  if (!productRes.ok) {
    const err = await productRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as { message?: string }).message ?? "Product creation failed" },
      { status: productRes.status },
    );
  }
  const product = (await productRes.json()) as { id: string };

  // 3. Create job in Laravel (decrements 1 credit, sets product → queued)
  const settings = `${background} · 72 frames · ${resolution}`;
  const jobRes = await laravelFetch("/api/jobs", token, {
    method: "POST",
    body: JSON.stringify({ product_id: product.id, settings }),
  });
  if (!jobRes.ok) {
    const err = await jobRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as { message?: string }).message ?? "Job creation failed" },
      { status: jobRes.status === 402 ? 402 : 500 },
    );
  }
  const { job } = (await jobRes.json()) as { job: { id: string; workspace_id: string } };

  // 4. Store imageUrl in Redis so retry can re-enqueue without re-upload (30-day TTL)
  const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
  });
  await redis.set(`product:${product.id}:imageUrl`, imageUrl, "EX", 60 * 60 * 24 * 30);
  await redis.quit();

  // 5. Enqueue to BullMQ — worker picks up and runs Higgsfield pipeline
  const queue = getQueue();
  await queue.add("render", {
    jobId: job.id,
    productId: product.id,
    workspaceId: job.workspace_id,
    imageUrl,
    category: category as RenderJobData["category"],
    background,
    include3d,
  });

  return NextResponse.json({ productId: product.id, jobId: job.id }, { status: 202 });
}
