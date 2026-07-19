"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ProductThumb } from "@/components/app/product-thumb";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSimulation } from "@/lib/simulation/provider";
import type { Product } from "@/lib/types";

export function RecentProducts({ initial }: { initial: Product[] }) {
  const sim = useSimulation();
  const products = [...sim.products, ...initial]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent products</CardTitle>
        <CardDescription>Latest uploads across the workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.id}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors duration-150 hover:bg-accent"
              >
                <ProductThumb product={product} className="size-10 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {product.name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {product.sku}
                  </p>
                </div>
                <StatusBadge status={product.status} />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Link
          href="/products"
          className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all products
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
