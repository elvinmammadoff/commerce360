// Worker HTTP client — uses service token, runs outside Next.js context.
const API_BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";
const SERVICE_TOKEN = process.env.API_SERVICE_TOKEN ?? "";

async function workerFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${SERVICE_TOKEN}`,
      ...(options.headers as Record<string, string>),
    },
  });
}

export async function patchJob(
  jobId: string,
  data: { stage?: string; progress?: number; error?: string; completed_at?: string }
): Promise<void> {
  const res = await workerFetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`patchJob ${jobId} → ${res.status}`);
}

export async function patchProduct(
  productId: string,
  data: { status: string; completed_at?: string }
): Promise<void> {
  const res = await workerFetch(`/api/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`patchProduct ${productId} → ${res.status}`);
}

export async function refundRenderCredit(workspaceId: string, jobId: string): Promise<void> {
  const res = await workerFetch("/api/credits/refund", {
    method: "POST",
    body: JSON.stringify({ workspace_id: workspaceId, job_id: jobId }),
  });
  if (!res.ok) throw new Error(`refundRenderCredit ${jobId} → ${res.status}`);
}
