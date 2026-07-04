"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLiveFixtureJobs } from "@/hooks/use-live-fixture-jobs";
import { getStage } from "@/lib/pipeline";
import { useSimulation } from "@/lib/simulation/provider";
import type { GenerationJob } from "@/lib/types";

function RenderRow({ job }: { job: GenerationJob }) {
  const stage = getStage(job.stage);
  const progress = Math.round(job.progress);
  return (
    <li>
      <Link
        href={`/products/${job.productId}`}
        className="group block rounded-xl border border-border bg-background/40 p-4 transition-colors duration-200 hover:border-brand/40"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-foreground">
            {job.productName}
          </p>
          <StatusBadge status={job.status} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Progress
            value={progress}
            className="h-1.5 flex-1"
            aria-label={`${job.productName} render progress`}
          />
          <span className="w-9 text-right font-mono text-xs text-muted-foreground tabular-nums">
            {progress}%
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {stage.label}
          <span className="text-muted-foreground/60"> · {stage.engine}</span>
        </p>
      </Link>
    </li>
  );
}

export function ActiveRenders({ initialJobs }: { initialJobs: GenerationJob[] }) {
  const sim = useSimulation();
  const liveFixtureJobs = useLiveFixtureJobs(initialJobs);
  const active = [
    ...sim.jobs.filter((j) => j.status === "queued" || j.status === "running"),
    ...liveFixtureJobs,
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Active renders</CardTitle>
          <CardDescription>Live pipeline progress</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          <Link href="/history">
            All jobs <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {active.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No active renders"
            description="Upload a product photo and watch the pipeline run."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/upload">New product</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {active.map((job) => (
              <RenderRow key={job.id} job={job} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
