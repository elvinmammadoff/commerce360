"use client";

import * as React from "react";
import { Activity, ArrowUpRight, Building2, Cpu, DollarSign } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCompact, formatCurrency, formatDate, formatDuration, formatNumber } from "@/lib/format";
import { getStage } from "@/lib/pipeline";
import { cn } from "@/lib/utils";
import type {
  AdminJobRow,
  AdminStats,
  AdminWorkspaceRow,
  RevenuePoint,
} from "@/lib/types";

const revenueConfig = {
  mrr: {
    label: "MRR",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const PLAN_BADGE: Record<AdminWorkspaceRow["plan"], string> = {
  starter: "border-border bg-muted/40 text-muted-foreground",
  growth: "border-brand/25 bg-brand/10 text-brand",
  scale: "border-chart-3/25 bg-chart-3/10 text-chart-3",
  enterprise: "border-warning/25 bg-warning/10 text-warning",
};

const WS_STATUS_BADGE: Record<AdminWorkspaceRow["status"], string> = {
  active: "border-success/25 bg-success/10 text-success",
  trial: "border-brand/25 bg-brand/10 text-brand",
  past_due: "border-destructive/25 bg-destructive/10 text-destructive",
};

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground/70" aria-hidden="true" />
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

/** Admin job rows tick forward so the ops view feels live. */
function useLiveAdminJobs(initial: AdminJobRow[]) {
  const [jobs, setJobs] = React.useState(initial);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.status !== "running") return job;
          const progress = Math.min(97, job.progress + Math.random() * 1.4);
          return { ...job, progress };
        }),
      );
    }, 1800);
    return () => window.clearInterval(interval);
  }, []);

  return jobs;
}

export function AdminView({
  stats,
  revenue,
  workspaces,
  jobs,
}: {
  stats: AdminStats;
  revenue: RevenuePoint[];
  workspaces: AdminWorkspaceRow[];
  jobs: AdminJobRow[];
}) {
  const liveJobs = useLiveAdminJobs(jobs);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="MRR"
          value={
            <AnimatedNumber
              value={stats.mrr}
              format={(v) => formatCurrency(v)}
            />
          }
          hint={
            <span className="text-success">
              ↑ {stats.mrrGrowthPct}% month over month
            </span>
          }
          icon={DollarSign}
        />
        <KpiCard
          label="Active workspaces"
          value={<AnimatedNumber value={stats.activeWorkspaces} />}
          hint={
            <span className="text-success">
              ↑ {stats.workspacesGrowthPct}% month over month
            </span>
          }
          icon={Building2}
        />
        <KpiCard
          label="Jobs today"
          value={<AnimatedNumber value={stats.jobsToday} />}
          hint={`${stats.successRatePct}% success · avg ${formatDuration(stats.avgRenderSeconds)}`}
          icon={Activity}
        />
        <KpiCard
          label="GPU utilization"
          value={`${stats.gpuUtilizationPct}%`}
          hint={`${stats.uptimePct}% uptime · 90 days`}
          icon={Cpu}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>MRR by month, 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-64 w-full">
              <BarChart data={revenue} margin={{ left: -8, right: 8, top: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  width={44}
                  tickFormatter={(v: number) => `$${formatCompact(v)}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">
                          {formatCurrency(Number(value))}
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="mrr"
                  fill="var(--color-mrr)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Render queue</CardTitle>
            <CardDescription>Live across all workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {liveJobs.slice(0, 5).map((job) => (
                <li
                  key={job.id}
                  className="rounded-xl border border-border bg-background/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{job.product}</p>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {job.workspace}
                    {job.status === "running" && (
                      <> · {getStage(job.stage as Parameters<typeof getStage>[0]).label}</>
                    )}
                  </p>
                  {job.status === "running" && (
                    <div className="mt-2 flex items-center gap-2">
                      <Progress
                        value={job.progress}
                        className="h-1 flex-1"
                        aria-label={`${job.product} progress`}
                      />
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {Math.round(job.progress)}%
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>Top accounts by activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-card hover:bg-card">
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden sm:table-cell">Plan</TableHead>
                  <TableHead className="hidden text-right md:table-cell">
                    Products
                  </TableHead>
                  <TableHead className="hidden text-right lg:table-cell">
                    Credits used
                  </TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="hidden text-right xl:table-cell">
                    Joined
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaces.map((ws) => (
                  <TableRow key={ws.id}>
                    <TableCell>
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        {ws.company}
                        {ws.company === "Fernhaven Home" && (
                          <ArrowUpRight
                            className="size-3.5 text-brand"
                            aria-label="This workspace"
                          />
                        )}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {ws.id}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={cn("capitalize", PLAN_BADGE[ws.plan])}
                      >
                        {ws.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-right font-mono text-sm tabular-nums md:table-cell">
                      {formatNumber(ws.products)}
                    </TableCell>
                    <TableCell className="hidden text-right font-mono text-sm tabular-nums lg:table-cell">
                      {formatNumber(ws.creditsUsed)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {ws.mrr > 0 ? formatCurrency(ws.mrr) : "—"}
                    </TableCell>
                    <TableCell className="hidden text-right sm:table-cell">
                      <Badge
                        variant="outline"
                        className={cn("capitalize", WS_STATUS_BADGE[ws.status])}
                      >
                        {ws.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-right text-sm whitespace-nowrap text-muted-foreground xl:table-cell">
                      {formatDate(ws.joinedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
