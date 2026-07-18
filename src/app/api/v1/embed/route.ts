import { NextRequest, NextResponse } from "next/server";

import { shareUrl } from "@/lib/share";

/**
 * Public embed resolver for the drop-in `<script>` widget.
 *
 *   GET /api/v1/embed?key=orb_live_...&sku=ARA-042-IVY
 *
 * The widget calls this from third-party product pages, so responses are
 * CORS-open and contain only public viewer data (never wallet/account info).
 * Phase 1 resolves from the bundled catalog; Phase 2 swaps in a Laravel
 * lookup that scopes the SKU to the workspace behind the API key.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")?.trim();
  const sku = req.nextUrl.searchParams.get("sku")?.trim();

  if (!key) {
    return NextResponse.json(
      { error: "Missing data-key" },
      { status: 401, headers: CORS },
    );
  }
  if (!sku) {
    return NextResponse.json(
      { error: "Missing data-sku" },
      { status: 400, headers: CORS },
    );
  }

  // Phase 2: validate `key` → workspace via Laravel, then scope the SKU lookup
  // to that workspace. Phase 1 resolves against the bundled catalog.
  const { products } = await import("@/lib/data/fixtures/products");
  const product = products.find(
    (p) =>
      p.sku.toLowerCase() === sku.toLowerCase() &&
      p.status === "completed" &&
      p.assets,
  );

  if (!product || !product.assets) {
    return NextResponse.json(
      { error: `No published 360° view for SKU ${sku}` },
      { status: 404, headers: CORS },
    );
  }

  const slug = product.shareSlug ?? product.id;
  // Absolute URL — the widget runs on third-party origins, so a relative
  // asset path would resolve against the merchant's domain.
  const videoUrl = new URL(
    product.assets.orbitVideoUrl,
    req.nextUrl.origin,
  ).toString();

  return NextResponse.json(
    {
      sku: product.sku,
      name: product.name,
      orbit_video_url: videoUrl,
      video_resolution: product.assets.videoResolution,
      frame_count: product.assets.frameCount,
      share_url: shareUrl(slug),
      hotspots: product.hotspots ?? [],
    },
    { headers: { ...CORS, "Cache-Control": "public, max-age=300" } },
  );
}
