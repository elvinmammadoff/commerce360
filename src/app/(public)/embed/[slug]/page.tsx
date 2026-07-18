import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicViewer } from "@/components/public/public-viewer";
import { getProductBySlug } from "@/lib/data";

// Embeds are wide-open by design — they render inside third-party product
// pages. `notFound()` handles bad slugs without leaking anything else.
export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.assets) notFound();

  return (
    <div className="relative h-svh w-full bg-black">
      <PublicViewer product={product} variant="embed" />
      <Link
        href="https://orbittify.com"
        target="_blank"
        rel="noopener"
        className="absolute right-2 bottom-2 z-10 rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] text-white/60 backdrop-blur-sm transition-colors hover:text-white"
      >
        Orbittify
      </Link>
    </div>
  );
}
