"use client";

import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";

import { TurntableViewer } from "@/components/app/viewer/turntable-viewer";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulation } from "@/lib/simulation/provider";
import type { Product } from "@/lib/types";

export function ViewerStage({
  initialProduct,
  productId,
}: {
  initialProduct?: Product;
  productId: string;
}) {
  const sim = useSimulation();
  const product =
    sim.products.find((p) => p.id === productId) ?? initialProduct;

  if (!product || !product.assets) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <EmptyState
          icon={PackageSearch}
          title={product ? "No viewer for this product yet" : "Product not found"}
          description={
            product
              ? "The render hasn't completed, so there's nothing to spin."
              : "It may have been removed, or the link is wrong."
          }
          action={
            <Button asChild variant="outline" size="sm">
              <Link href={product ? `/products/${product.id}` : "/products"}>
                {product ? "Back to product" : "Back to products"}
              </Link>
            </Button>
          }
          className="w-full max-w-md border-none"
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col bg-black">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center gap-3 p-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 text-white/85 hover:bg-white/10 hover:text-white"
        >
          <Link href={`/products/${product.id}`}>
            <ArrowLeft aria-hidden="true" /> {product.name}
          </Link>
        </Button>
        <Badge
          variant="outline"
          className="ml-auto border-white/15 bg-black/40 font-mono text-[11px] text-white/75 backdrop-blur-sm"
        >
          {product.assets.videoResolution} · {product.assets.frameCount} frames
        </Badge>
      </header>
      <TurntableViewer
        src={product.assets.orbitVideoUrl}
        frameCount={product.assets.frameCount}
        productName={product.name}
        hotspots={product.hotspots}
        autoRotate
        className="min-h-svh flex-1 rounded-none border-none bg-black"
      />
    </div>
  );
}
