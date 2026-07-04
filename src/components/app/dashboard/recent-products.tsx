"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ProductThumb } from "@/components/app/product-thumb";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSimulation } from "@/lib/simulation/provider";
import type { Product } from "@/lib/types";

export function RecentProducts({ initial }: { initial: Product[] }) {
  const sim = useSimulation();
  const products = [...sim.products, ...initial].slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Recent products</CardTitle>
          <CardDescription>Latest uploads across the workspace</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          <Link href="/products">
            All <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
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
    </Card>
  );
}
