"use client";

import * as React from "react";
import Link from "next/link";
import { History as HistoryIcon, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLiveFixtureJobs } from "@/hooks/use-live-fixture-jobs";
import { formatDuration } from "@/lib/format";
import { getStage } from "@/lib/pipeline";
import { useSimulation } from "@/lib/simulation/provider";
import type { JobStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: JobStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "running", label: "Running" },
  { value: "queued", label: "Queued" },
  { value: "failed", label: "Failed" },
];

import type { GenerationJob } from "@/lib/types";

function StageCell({ job }: { job: GenerationJob }) {
  const stage = getStage(job.stage);
  if (job.status === "completed") {
    return <span className="text-sm text-muted-foreground">All stages passed</span>;
  }
  if (job.status === "failed") {
    return (
      <Tooltip>
        <TooltipTrigger className="cursor-help text-left text-sm text-destructive underline decoration-destructive/40 decoration-dotted underline-offset-4">
          Failed at {stage.label.toLowerCase()}
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{job.error}</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <span className="text-sm text-foreground">
      {stage.label}
      <span className="text-muted-foreground"> · {Math.round(job.progress)}%</span>
    </span>
  );
}

export function HistoryTable({ initial }: { initial: GenerationJob[] }) {
  const sim = useSimulation();
  const liveFixture = useLiveFixtureJobs(initial);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<JobStatus | "all">("all");

  const all = [...sim.jobs, ...liveFixture];
  const filtered = all.filter((job) => {
    const matchesQuery =
      query.trim() === "" ||
      `${job.productName} ${job.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || job.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {all.length} renders ·{" "}
          {all.filter((j) => j.status === "completed").length} completed ·{" "}
          {all.filter((j) => j.status === "failed").length} failed (refunded)
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
              placeholder="Search product or job id…"
              className="w-full pl-8 sm:w-64"
              aria-label="Search render history"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as JobStatus | "all")}
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
          icon={HistoryIcon}
          title="No renders match"
          description="Try a different search or clear the status filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card">
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Stage</TableHead>
                <TableHead className="hidden xl:table-cell">Settings</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Duration
                </TableHead>
                <TableHead className="text-right">Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Link
                      href={`/products/${job.productId}`}
                      className="group block"
                    >
                      <p className="max-w-56 truncate font-medium text-foreground group-hover:underline group-hover:underline-offset-4">
                        {job.productName}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        {job.id}
                        <Badge
                          variant="secondary"
                          className="px-1 font-mono text-[10px]"
                        >
                          v{job.version}
                        </Badge>
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <StageCell job={job} />
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                    {job.settings}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono text-sm tabular-nums md:table-cell">
                    {job.durationSeconds !== null
                      ? formatDuration(job.durationSeconds)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm whitespace-nowrap text-muted-foreground">
                    <RelativeTime iso={job.createdAt} />
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
