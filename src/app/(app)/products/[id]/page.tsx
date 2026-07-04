import type { Metadata } from "next";

import { ProductDetailView } from "@/components/app/products/product-detail-view";
import { getJobs, getProduct } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Fixture lookup on the server; simulated products resolve client-side
  // inside ProductDetailView via the simulation store.
  const [product, jobs] = await Promise.all([getProduct(id), getJobs()]);
  const productJobs = jobs.filter((job) => job.productId === id);

  return (
    <ProductDetailView
      initialProduct={product}
      initialJobs={productJobs}
      productId={id}
    />
  );
}
