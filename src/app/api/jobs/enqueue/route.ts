import { NextRequest, NextResponse } from "next/server";
import { Queue } from "bullmq";
import Redis from "ioredis";
import type { RenderJobData } from "@/worker/index";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";

function getQueue() {
  const connection = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
  });
  return new Queue<RenderJobData>("render-jobs", { connection });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("c360-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRes = await fetch(`${API_BASE}/api/user`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!userRes.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, imageUrl } = body as { productId?: string; imageUrl?: string };
  if (!productId || !imageUrl) {
    return NextResponse.json({ error: "productId and imageUrl required" }, { status: 400 });
  }

  const jobRes = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ product_id: productId, image_url: imageUrl }),
  });

  if (!jobRes.ok) {
    const err = await jobRes.json().catch(() => ({}));
    const status = jobRes.status === 402 ? 402 : 500;
    return NextResponse.json(
      { error: (err as { message?: string }).message ?? "Failed to create job" },
      { status }
    );
  }

  const { job } = (await jobRes.json()) as { job: { id: string; workspace_id: string } };

  const queue = getQueue();
  await queue.add("render", {
    jobId: job.id,
    productId,
    workspaceId: job.workspace_id,
    imageUrl,
  });

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
