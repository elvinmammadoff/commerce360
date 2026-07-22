import { NextRequest, NextResponse } from "next/server";
import { Queue } from "bullmq";
import Redis from "ioredis";
import type { RenderJobData } from "@/worker/index";
import { uploadImage } from "@/lib/storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";

function getRedis() {
  return new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
  });
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("c360-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRes = await laravelFetch("/api/user", token);
  if (!userRes.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: productId } = await params;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const background = (formData.get("background") as string | null) || "Studio white";
  const resolution = (formData.get("resolution") as string | null) || "4K";
  const category = (formData.get("category") as string | null) || "general";

  let imageUrl: string;

  if (file) {
    // Re-upload provided — optimize, upload to R2, and update stored imageUrl
    imageUrl = await uploadImage(file);

    const redis = getRedis();
    await redis.set(`product:${productId}:imageUrl`, imageUrl, "EX", 60 * 60 * 24 * 30);
    await redis.quit();
  } else {
    // No re-upload — look up stored imageUrl from previous render
    const redis = getRedis();
    const stored = await redis.get(`product:${productId}:imageUrl`);
    await redis.quit();

    if (!stored) {
      return NextResponse.json(
        { error: "Original image not found. Please re-upload your photo to retry." },
        { status: 400 },
      );
    }
    imageUrl = stored;
  }

  // Create new job in Laravel (decrements 1 credit, resets product → queued)
  const settings = `${background} · 72 frames · ${resolution}`;
  const jobRes = await laravelFetch("/api/jobs", token, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, settings }),
  });
  if (!jobRes.ok) {
    const err = await jobRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as { message?: string }).message ?? "Job creation failed" },
      { status: jobRes.status === 402 ? 402 : 500 },
    );
  }
  const { job } = (await jobRes.json()) as { job: { id: string; workspace_id: string } };

  // Enqueue to BullMQ
  const queue = new Queue<RenderJobData>("render-jobs", { connection: getRedis() });
  await queue.add("render", {
    jobId: job.id,
    productId,
    workspaceId: job.workspace_id,
    imageUrl,
    category: category as RenderJobData["category"],
    background,
  });

  return NextResponse.json({ productId, jobId: job.id }, { status: 202 });
}
