"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Coins,
  DollarSign,
  Package,
  Sparkles,
  TriangleAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { PaymentBadge } from "@/components/admin/admin-badges";
import { KpiCard } from "@/components/admin/kpi-card";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { useLiveAdminJobs } from "@/hooks/use-live-admin-jobs";
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/lib/format";
import { getStage } from "@/lib/pipeline";
import type {
  AdminJobRow,
  AdminOrderRow,
  AdminStats,
  AdminUserRow,
  RevenuePoint,
  StageId,
} from "@/lib/types";

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function OverviewView({
  stats,
  revenue,
  users,
  orders,
  jobs,
}: {
  stats: AdminStats;
  revenue: RevenuePoint[];
  users: AdminUserRow[];
  orders: AdminOrderRow[];
  jobs: AdminJobRow[];
}) {
  const liveJobs = useLiveAdminJobs(jobs);
  const activeJobs = liveJobs.filter(
    (job) => job.status === "running" || job.status === "queued",
  );

  const topCustomers = React.useMemo(
    () =>
      [...users]
        .sort((a, b) => b.creditsPurchased - a.creditsPurchased)
        .slice(0, 5),
    [users],
  );
  const topCustomerMax = topCustomers[0]?.creditsPurchased ?? 1;
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Platform KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={
            <AnimatedNumber
              value={stats.totalRevenue}
              format={(v) => formatCurrency(v)}
            />
          }
          hint={
            <span className="text-success">
              ↑ {stats.revenueGrowthPct}% month over month
            </span>
          }
          icon={DollarSign}
        />
        <KpiCard
          label="Total users"
          value={<AnimatedNumber value={stats.totalUsers} />}
          hint={
            <span className="text-success">
              ↑ {stats.usersGrowthPct}% month over month
            </span>
          }
          icon={Users}
        />
        <KpiCard
          label="Active users"
          value={<AnimatedNumber value={stats.activeUsers} />}
          hint="Active in the last 30 days"
          icon={UserCheck}
        />
        <KpiCard
          label="Credits sold"
          value={<AnimatedNumber value={stats.creditsSold} />}
          hint="Lifetime, all customers"
          icon={Coins}
        />
        <KpiCard
          label="Credits used"
          value={<AnimatedNumber value={stats.creditsUsed} />}
          hint="1 credit = 1 render"
          icon={Sparkles}
        />
        <KpiCard
          label="Total renders"
          value={<AnimatedNumber value={stats.productsRendered} />}
          hint="Lifetime completed renders"
          icon={Package}
        />
        <KpiCard
          label="Pending jobs"
          value={<AnimatedNumber value={stats.pendingJobs} />}
          hint="Queued or running right now"
          icon={Clock}
        />
        <KpiCard
          label="Failed jobs"
          value={<AnimatedNumber value={stats.failedJobs} />}
          hint="Last 30 days · auto-refunded"
          icon={TriangleAlert}
        />
      </div>

      {/* Revenue + live render queue */}
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Credit sales by month, 2026</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/analytics">
                  View analytics <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </CardAction>
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
                  dataKey="revenue"
                  fill="var(--color-revenue)"
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
            <CardDescription>Live across all customers</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/jobs">
                  All jobs <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {activeJobs.slice(0, 5).map((job) => (
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
                      <> · {getStage(job.stage as StageId).label}</>
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

      {/* Recent orders + top customers */}
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest one-time credit purchases</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/orders">
                  All orders <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card hover:bg-card">
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Pack</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="hidden text-right md:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{order.customer}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {order.id}
                        </p>
                      </TableCell>
                      <TableCell className="hidden text-sm sm:table-cell">
                        {order.packName}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        {formatCurrency(order.amount)}
                      </TableCell>
                      <TableCell className="hidden text-right text-sm whitespace-nowrap text-muted-foreground md:table-cell">
                        {formatDate(order.purchasedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <PaymentBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Top customers</CardTitle>
            <CardDescription>By lifetime credits purchased</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/users">
                  All users <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {topCustomers.map((user, i) => (
                <li key={user.id} className="flex items-center gap-4">
                  <span className="w-5 shrink-0 text-center font-mono text-sm text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="truncate text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {user.company}
                      </Link>
                      <p className="shrink-0 font-mono text-sm tabular-nums">
                        {formatNumber(user.creditsPurchased)}{" "}
                        <span className="text-muted-foreground">credits</span>
                      </p>
                    </div>
                    <Progress
                      value={(user.creditsPurchased / topCustomerMax) * 100}
                      className="mt-2 h-1.5"
                      aria-label={`${user.company} credits purchased`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
