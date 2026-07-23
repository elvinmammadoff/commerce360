import { NextResponse } from "next/server";

// Stable liveness probe for the deploy script and future monitoring.
// Deliberately does no auth, no DB, no rendering — it must stay 200 as long
// as the Next.js process is up, independent of the homepage or middleware.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    commit: process.env.GIT_COMMIT ?? null,
    timestamp: new Date().toISOString(),
  });
}
