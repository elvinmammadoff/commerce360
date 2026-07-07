"use client";

import { Coins, Package, ShoppingBag, Sparkles } from "lucide-react";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardContent } from "@/components/ui/card";
import { useSimulation } from "@/lib/simulation/provider";
import type { Product, Workspace } from "@/lib/types";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  suffix?: string;
}) {
  return (
    <Card className="hover:ring-foreground/20 hover:elevate-md">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="flex size-7 items-center justify-center rounded-lg bg-muted/60 ring-1 ring-inset ring-border/60">
            <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </span>
        </div>
        <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          {suffix && (
            <span className="text-base font-normal text-muted-foreground">
              {suffix}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function StatCards({
  products,
  workspace,
}: {
  products: Product[];
  workspace: Workspace;
}) {
  const sim = useSimulation();

  const allProducts = [...sim.products, ...products];
  // Live credit wallet — one-time purchases only, credits never expire.
  const totalPurchased = workspace.totalPurchased + sim.creditsPurchased;
  const creditsUsed = workspace.creditsUsed + sim.creditsUsed;
  const productsRendered = allProducts.filter(
    (p) => p.status === "completed",
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Current credit balance"
        value={sim.creditsBalance}
        hint="In your wallet · never expire"
        icon={Coins}
      />
      <StatCard
        label="Lifetime credits purchased"
        value={totalPurchased}
        hint="Total credits bought"
        icon={ShoppingBag}
      />
      <StatCard
        label="Total credits used"
        value={creditsUsed}
        hint="1 credit per render"
        icon={Sparkles}
      />
      <StatCard
        label="Products rendered"
        value={productsRendered}
        hint={`${allProducts.length} total · ${productsRendered} with live viewers`}
        icon={Package}
      />
    </div>
  );
}
