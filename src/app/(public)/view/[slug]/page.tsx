import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Monitor, Film, ImageIcon, Package, ArrowRight, Check } from "lucide-react";

import { PublicViewer } from "@/components/public/public-viewer";
import { CopyLinkButton } from "@/components/public/copy-link-button";
import { Logo } from "@/components/shared/logo";
import { getProductBySlug } from "@/lib/data";

const SITE_URL = "https://orbittify.com";

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
    title: `${product.name} – Interactive 360° Product Viewer | Orbittify`,
    description: `Interactive 360° product viewer, orbit video and marketplace-ready assets for ${product.name}. Generated with Orbittify AI.`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${product.name} – 360° Product Experience`,
      description: `Explore every angle of ${product.name}. Interactive viewer, orbit video, and marketplace assets generated with Orbittify.`,
      type: "website",
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.assets) notFound();

  const { assets } = product;
  const shareUrl = `${SITE_URL}/view/${product.shareSlug ?? slug}`;

  const hasVideo = Boolean(assets.orbitVideoUrl);
  const hasMarketplace = Boolean(assets.marketplaceReady);
  const hasModel = Boolean(assets.modelUrl);

  const stats = [
    `${assets.frameCount} Frames`,
    `${assets.videoResolution} Orbit Video`,
    ...(hasMarketplace ? ["Marketplace Ready"] : []),
    ...(product.completedAt ? [formatDate(product.completedAt)] : []),
  ];

  const includedAssets: { icon: ReactNode; label: string }[] = [
    { icon: <Monitor className="size-5" />, label: "Interactive 360° Viewer" },
    ...(hasVideo ? [{ icon: <Film className="size-5" />, label: "Orbit Video" }] : []),
    ...(hasMarketplace ? [{ icon: <ImageIcon className="size-5" />, label: "Marketplace Images" }] : []),
    ...(hasModel ? [{ icon: <Package className="size-5" />, label: "3D Model" }] : []),
  ];

  return (
    <div className="min-h-svh bg-black text-white">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Logo href={SITE_URL} className="[&_span]:text-white/90" />
        <Link
          href={SITE_URL}
          className="text-xs text-white/40 transition-colors hover:text-white/70"
        >
          Made with Orbittify ↗
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        {/* ── Hero ── */}
        <section className="pb-12 pt-8">
          <p className="mb-2 text-sm capitalize text-white/40">
            {product.category?.replace(/_/g, " ")} · Interactive 360° viewer
          </p>
          <h1 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
            <div className="aspect-square">
              <PublicViewer product={product} />
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            {stats.map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                {i > 0 && <span className="text-white/20" aria-hidden>·</span>}
                <span className="text-sm text-white/50">{s}</span>
              </span>
            ))}
          </div>
        </section>

        {/* ── Orbit Video ── */}
        {hasVideo && (
          <section className="border-t border-white/10 py-12">
            <h2 className="mb-4 text-lg font-semibold">Orbit Video</h2>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={assets.orbitVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full"
              />
            </div>
            <p className="mt-2 text-sm text-white/40">
              {assets.videoDurationSeconds.toFixed(1)}s seamless loop · {assets.videoResolution} resolution
            </p>
          </section>
        )}

        {/* ── Assets Included ── */}
        <section className="border-t border-white/10 py-12">
          <h2 className="mb-6 text-lg font-semibold">What&apos;s included</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {includedAssets.map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <span className="text-white/50">{icon}</span>
                <span className="text-sm font-medium leading-snug text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-white/10 py-12">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="mb-2 text-2xl font-semibold leading-tight tracking-tight">
              Turn One Product Photo<br />
              into an Interactive Experience.
            </h2>
            <p className="mb-6 text-sm text-white/50">
              Upload one photo. Orbittify AI generates everything.
            </p>
            <ul className="mb-8 space-y-2.5">
              {[
                "Interactive 360° Viewer",
                "Orbit Video",
                "Marketplace Images",
                "Share Page",
                "3D Model",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                  <Check className="size-4 shrink-0 text-[#5b8cff]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={SITE_URL}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5b8cff] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create with Orbittify
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ── Share ── */}
        <section className="border-t border-white/10 py-12">
          <p className="mb-1 text-sm font-medium text-white/60">Share this experience</p>
          <p className="mb-4 text-xs text-white/30">Anyone with this link can view this product.</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 truncate rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white/60">
              {shareUrl}
            </code>
            <CopyLinkButton url={shareUrl} />
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Logo href={SITE_URL} className="[&_span]:text-white/50" />
          <p className="text-xs text-white/25">AI-Powered Product Visualization Platform</p>
        </div>
      </footer>
    </div>
  );
}
