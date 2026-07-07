"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

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
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatDateShort,
  formatNumber,
} from "@/lib/format";
import type {
  DailyRenderPoint,
  MonthlyRenderPoint,
  RevenuePoint,
  UserGrowthPoint,
} from "@/lib/types";

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

const dailyConfig = {
  renders: { label: "Renders", color: "var(--chart-2)" },
} satisfies ChartConfig;

const monthlyConfig = {
  renders: { label: "Renders", color: "var(--chart-5)" },
} satisfies ChartConfig;

const creditsConfig = {
  creditsSold: { label: "Credits sold", color: "var(--chart-4)" },
} satisfies ChartConfig;

const growthConfig = {
  users: { label: "Users", color: "var(--chart-3)" },
} satisfies ChartConfig;

const AXIS = {
  tickLine: false,
  axisLine: false,
} as const;

export function AnalyticsView({
  revenue,
  daily,
  monthly,
  growth,
}: {
  revenue: RevenuePoint[];
  daily: DailyRenderPoint[];
  monthly: MonthlyRenderPoint[];
  growth: UserGrowthPoint[];
}) {
  return (
    <div className="space-y-6">
      {/* Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>
            One-time credit sales by month, 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueConfig} className="h-72 w-full">
            <BarChart data={revenue} margin={{ left: -8, right: 8, top: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" {...AXIS} tickMargin={10} />
              <YAxis
                {...AXIS}
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
                maxBarSize={56}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Daily renders */}
        <Card>
          <CardHeader>
            <CardTitle>Daily renders</CardTitle>
            <CardDescription>
              Completed pipeline renders — last 14 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dailyConfig} className="h-64 w-full">
              <AreaChart data={daily} margin={{ left: -8, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="fillDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-renders)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-renders)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  {...AXIS}
                  tickMargin={10}
                  minTickGap={24}
                  tickFormatter={(v: string) => formatDateShort(v)}
                />
                <YAxis
                  {...AXIS}
                  tickMargin={6}
                  width={44}
                  tickFormatter={(v: number) => formatCompact(v)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) =>
                        formatDate(String(payload?.[0]?.payload?.date ?? ""))
                      }
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">
                          {formatNumber(Number(value))} renders
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="renders"
                  type="natural"
                  fill="url(#fillDaily)"
                  stroke="var(--color-renders)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly render volume */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly render volume</CardTitle>
            <CardDescription>
              Completed renders per month · Jul is the trailing 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyConfig} className="h-64 w-full">
              <BarChart data={monthly} margin={{ left: -8, right: 8, top: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" {...AXIS} tickMargin={10} />
                <YAxis
                  {...AXIS}
                  tickMargin={6}
                  width={44}
                  tickFormatter={(v: number) => formatCompact(v)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">
                          {formatNumber(Number(value))} renders
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="renders"
                  fill="var(--color-renders)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Credits sold */}
        <Card>
          <CardHeader>
            <CardTitle>Credits sold</CardTitle>
            <CardDescription>Credits purchased by month, 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={creditsConfig} className="h-64 w-full">
              <BarChart data={revenue} margin={{ left: -8, right: 8, top: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" {...AXIS} tickMargin={10} />
                <YAxis
                  {...AXIS}
                  tickMargin={6}
                  width={44}
                  tickFormatter={(v: number) => formatCompact(v)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">
                          {formatNumber(Number(value))} credits
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="creditsSold"
                  fill="var(--color-creditsSold)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User growth */}
        <Card>
          <CardHeader>
            <CardTitle>User growth</CardTitle>
            <CardDescription>
              Cumulative registered users, 2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthConfig} className="h-64 w-full">
              <AreaChart data={growth} margin={{ left: -8, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="fillGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-users)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-users)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" {...AXIS} tickMargin={10} />
                <YAxis
                  {...AXIS}
                  tickMargin={6}
                  width={44}
                  tickFormatter={(v: number) => formatCompact(v)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">
                          {formatNumber(Number(value))} users
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="users"
                  type="natural"
                  fill="url(#fillGrowth)"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
