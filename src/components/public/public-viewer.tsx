"use client";

import { TurntableViewer } from "@/components/app/viewer/turntable-viewer";
import type { Product } from "@/lib/types";

/**
 * Account-free 360° viewer for public share pages and iframe embeds. Unlike
 * the in-app `ViewerStage`, it takes a fully resolved product and never
 * touches the simulation store — the viewer works for anonymous visitors.
 */
export function PublicViewer({
  product,
  variant = "page",
}: {
  product: Product;
  /** `embed` strips all chrome for tight iframe embedding. */
  variant?: "page" | "embed";
}) {
  if (!product.assets) return null;

  return (
    <TurntableViewer
      src={product.assets.orbitVideoUrl}
      frameCount={product.assets.frameCount}
      productName={product.name}
      hotspots={product.hotspots}
      autoRotate
      compact={variant === "embed"}
      className="size-full rounded-none border-none bg-black"
    />
  );
}
