import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { PublicViewer } from "@/components/public/public-viewer";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "360° viewer" };
  const cover = product.assets?.frameUrls?.[0];
  return {
    title: `${product.name} — 360° view`,
    description: `Spin ${product.name} in 360°. Interactive product viewer by Orbittify.`,
    // Share pages are unlisted-by-link, not landing pages — keep them out of
    // search indexes.
    robots: { index: false, follow: false },
    openGraph: {
      title: `${product.name} — 360° view`,
      type: "website",
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
  };
}

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.assets) notFound();

  return (
    <div className="flex min-h-svh flex-col bg-black text-white">
      <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-medium sm:text-base">
            {product.name}
          </h1>
          {product.sku && (
            <p className="truncate font-mono text-xs text-white/50">
              {product.sku}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-white/15 bg-white/5 font-mono text-[11px] text-white/75"
        >
          {product.assets.videoResolution} · {product.assets.frameCount} frames
        </Badge>
      </header>

      <main className="relative flex-1">
        <PublicViewer product={product} />
      </main>

      <footer className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-6">
        <Logo href="https://orbittify.com" className="[&_span]:text-white/90" />
        <Link
          href="https://orbittify.com"
          className="inline-flex items-center gap-1 text-xs text-white/60 transition-colors hover:text-white"
        >
          Make your own 360° views
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}
