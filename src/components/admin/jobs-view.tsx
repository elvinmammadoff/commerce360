"use client";

import * as React from "react";
import {
  CircleCheck,
  Clock,
  Cpu,
  ListChecks,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { KpiCard } from "@/components/admin/kpi-card";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLiveAdminJobs } from "@/hooks/use-live-admin-jobs";
import { formatTime } from "@/lib/format";
import { getStage } from "@/lib/pipeline";
import type { AdminJobRow, AdminStats, JobStatus, StageId } from "@/lib/types";

const TABS: { value: JobStatus; label: string }[] = [
  { value: "queued", label: "Queue" },
  { value: "running", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const EMPTY_COPY: Record<JobStatus, string> = {
  queued: "Nothing waiting — the queue is fully drained.",
  running: "No renders in flight right now.",
  completed: "Completed renders will appear here.",
  failed: "No failures — the pipeline is healthy.",
};

export function JobsView({
  stats,
  completedToday,
  initial,
}: {
  stats: AdminStats;
  /** Renders completed in the current day — head of the daily series. */
  completedToday: number;
  initial: AdminJobRow[];
}) {
  const liveJobs = useLiveAdminJobs(initial);
  const [tab, setTab] = React.useState<JobStatus>("running");
  // Demo-only overrides so Cancel/Retry visibly move rows between tabs.
  const [removed, setRemoved] = React.useState<Set<string>>(new Set());
  const [requeued, setRequeued] = React.useState<Set<string>>(new Set());

  const jobs = liveJobs
    .filter((job) => !removed.has(job.id))
    .map((job): AdminJobRow => {
      if (!requeued.has(job.id)) return job;
      return { ...job, status: "queued", stage: "queued", progress: 0, error: undefined };
    });

  const counts = Object.fromEntries(
    TABS.map((t) => [t.value, jobs.filter((j) => j.status === t.value).length]),
  ) as Record<JobStatus, number>;
  const visible = jobs.filter((job) => job.status === tab);

  const cancel = (job: AdminJobRow) => {
    setRemoved((prev) => new Set(prev).add(job.id));
    toast.success("Job cancelled", {
      description: `${job.product} removed from the queue — the credit was returned.`,
    });
  };

  const retry = (job: AdminJobRow) => {
    setRequeued((prev) => new Set(prev).add(job.id));
    toast.success("Job re-queued", {
      description: `${job.product} goes back through the full pipeline at no extra cost.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Pending jobs"
          value={<AnimatedNumber value={stats.pendingJobs} />}
          hint="Queued or running platform-wide"
          icon={Clock}
        />
        <KpiCard
          label="Processing now"
          value={<AnimatedNumber value={counts.running} />}
          hint="On dedicated GPU workers"
          icon={Cpu}
        />
        <KpiCard
          label="Completed today"
          value={<AnimatedNumber value={completedToday} />}
          hint="Median 11m 13s per render"
          icon={CircleCheck}
        />
        <KpiCard
          label="Failed jobs"
          value={<AnimatedNumber value={stats.failedJobs} />}
          hint="Last 30 days · auto-refunded"
          icon={TriangleAlert}
        />
      </div>

      <div className="space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as JobStatus)}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                <span className="ml-1 font-mono text-xs text-muted-foreground tabular-nums">
                  {counts[t.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {visible.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Nothing here"
            description={EMPTY_COPY[tab]}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-card hover:bg-card">
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Workspace
                  </TableHead>
                  {tab === "running" && (
                    <TableHead className="hidden sm:table-cell">
                      Stage
                    </TableHead>
                  )}
                  {tab === "failed" && (
                    <TableHead className="hidden sm:table-cell">
                      Failure reason
                    </TableHead>
                  )}
                  <TableHead className="hidden text-right lg:table-cell">
                    {tab === "queued" ? "Submitted" : "Started"}
                  </TableHead>
                  <TableHead
                    className={
                      tab === "running" ? "w-40 text-right" : "text-right"
                    }
                  >
                    {tab === "running" ? "Progress" : "Status"}
                  </TableHead>
                  {(tab === "queued" || tab === "failed") && (
                    <TableHead className="w-12 text-right">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{job.product}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {job.id}
                      </p>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {job.workspace}
                    </TableCell>
                    {tab === "running" && (
                      <TableCell className="hidden text-sm sm:table-cell">
                        {getStage(job.stage as StageId).label}
                      </TableCell>
                    )}
                    {tab === "failed" && (
                      <TableCell className="hidden max-w-xs text-sm text-muted-foreground sm:table-cell">
                        <span className="line-clamp-1">{job.error ?? "—"}</span>
                      </TableCell>
                    )}
                    <TableCell className="hidden text-right text-sm whitespace-nowrap text-muted-foreground lg:table-cell">
                      {formatTime(job.startedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {tab === "running" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Progress
                            value={job.progress}
                            className="h-1 w-24"
                            aria-label={`${job.product} progress`}
                          />
                          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                            {Math.round(job.progress)}%
                          </span>
                        </div>
                      ) : (
                        <StatusBadge status={job.status} />
                      )}
                    </TableCell>
                    {tab === "queued" && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Cancel ${job.product}`}
                          onClick={() => cancel(job)}
                        >
                          <X aria-hidden="true" />
                        </Button>
                      </TableCell>
                    )}
                    {tab === "failed" && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Retry ${job.product}`}
                          onClick={() => retry(job)}
                        >
                          <RotateCcw aria-hidden="true" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
