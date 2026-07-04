"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, Search } from "lucide-react";

import { ProductThumb } from "@/components/app/product-thumb";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { useSimulation } from "@/lib/simulation/provider";
import type { Product, ProductStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ProductStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "processing", label: "Processing" },
  { value: "queued", label: "Queued" },
  { value: "failed", label: "Failed" },
  { value: "draft", label: "Draft" },
];

function assetsSummary(product: Product): string {
  if (product.assets) {
    return `${product.assets.frameCount} frames · ${product.assets.videoResolution} video`;
  }
  if (product.status === "processing") return "Rendering…";
  if (product.status === "queued") return "In queue";
  if (product.status === "failed") return "Render failed";
  return "Source only";
}

export function ProductsTable({ initial }: { initial: Product[] }) {
  const router = useRouter();
  const sim = useSimulation();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<ProductStatus | "all">("all");

  const all = [...sim.products, ...initial];
  const filtered = all.filter((product) => {
    const matchesQuery =
      query.trim() === "" ||
      `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || product.status === status;
    return matchesQuery && matchesStatus;
  });

  const liveCount = all.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {formatNumber(all.length)} products ·{" "}
          <span className="text-success">{liveCount} live viewers</span>
        </p>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or SKU…"
              className="w-full pl-8 sm:w-64"
              aria-label="Search products"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as ProductStatus | "all")}
          >
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No products match"
          description="Try a different search or clear the status filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card">
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Assets</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Views
                </TableHead>
                <TableHead className="hidden text-right xl:table-cell">
                  Downloads
                </TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductThumb product={product} className="size-10 shrink-0" />
                      <div className="min-w-0">
                        <p className="max-w-64 truncate font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                        <span className="mt-1 inline-flex md:hidden">
                          <StatusBadge status={product.status} />
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {assetsSummary(product)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular-nums sm:table-cell">
                    {product.views > 0 ? formatNumber(product.views) : "—"}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm tabular-nums xl:table-cell">
                    {product.downloads > 0 ? formatNumber(product.downloads) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm whitespace-nowrap text-muted-foreground">
                    <RelativeTime iso={product.createdAt} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
