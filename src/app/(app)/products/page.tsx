import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ProductsTable } from "@/components/app/products/products-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  const products = await getProducts().catch(() => []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Products"
        description="Every product in your catalog, from source upload to live 360° viewer."
        actions={
          <Button asChild size="sm">
            <Link href="/upload">
              <Plus aria-hidden="true" /> New product
            </Link>
          </Button>
        }
      />
      <ProductsTable initial={products} />
    </div>
  );
}
