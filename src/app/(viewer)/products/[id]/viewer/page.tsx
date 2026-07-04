import type { Metadata } from "next";

import { ViewerStage } from "@/components/app/viewer/viewer-stage";
import { getProduct } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return {
    title: product ? `${product.name} — 360° viewer` : "360° viewer",
  };
}

export default async function FullscreenViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  return <ViewerStage initialProduct={product} productId={id} />;
}
