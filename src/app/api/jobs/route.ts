import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api-client";

/**
 * GET /api/jobs  — proxy to Laravel, used by client-side job polling.
 * The auth cookie is read server-side so the client never needs the raw token.
 */
export async function GET() {
  const res = await apiFetch("/api/jobs");
  if (!res.ok) {
    return NextResponse.json([], { status: res.status });
  }
  return NextResponse.json(await res.json());
}
