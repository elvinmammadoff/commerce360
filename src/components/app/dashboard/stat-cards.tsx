"use client";

import { Clock3, Coins, Package, Sparkles } from "lucide-react";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/format";
import { useSimulation } from "@/lib/simulation/provider";
import type { GenerationJob, Product, Workspace } from "@/lib/types";

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
    <Card className="transition-all duration-250 hover:border-border hover:shadow-[0_0_24px_-12px_rgba(91,140,255,0.35)]">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground/70" aria-hidden="true" />
        </div>
        <p className="text-2xl font-semibold tracking-tight text-foreground">
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
  jobs,
  workspace,
}: {
  products: Product[];
  jobs: GenerationJob[];
  workspace: Workspace;
}) {
  const sim = useSimulation();

  const allProducts = [...sim.products, ...products];
  const completedJobs = [
    ...sim.jobs.filter((j) => j.status === "completed"),
    ...jobs.filter((j) => j.status === "completed"),
  ];
  const completedWithDuration = completedJobs.filter(
    (j) => j.durationSeconds !== null,
  );
  const avgRender =
    completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, j) => sum + (j.durationSeconds ?? 0), 0) /
        completedWithDuration.length
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Products"
        value={allProducts.length}
        hint={`${allProducts.filter((p) => p.status === "completed").length} with live viewers`}
        icon={Package}
      />
      <StatCard
        label="Credits remaining"
        value={sim.creditsBalance}
        suffix={` / ${workspace.creditsPerMonth}`}
        hint="Renews Jul 26 · credits roll over"
        icon={Coins}
      />
      <StatCard
        label="Renders completed"
        value={completedJobs.length}
        hint="Since workspace creation"
        icon={Sparkles}
      />
      <StatCard
        label="Avg render time"
        value={avgRender > 0 ? formatDuration(avgRender) : "—"}
        hint="Photo to packaged assets"
        icon={Clock3}
      />
    </div>
  );
}
