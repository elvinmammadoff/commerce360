"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { formatDateShort } from "@/lib/format";
import type { EngagementPoint } from "@/lib/types";

const chartConfig = {
  views: {
    label: "Viewer loads",
    color: "var(--chart-1)",
  },
  interactions: {
    label: "360° interactions",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function EngagementChart({ data }: { data: EngagementPoint[] }) {
  const hasData = data.some((p) => p.views > 0 || p.interactions > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Viewer engagement</CardTitle>
        <CardDescription>
          Loads and 360° interactions across your share pages and embeds — last
          14 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-foreground">No engagement data yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Share your product links or embed the 360° viewer to start collecting engagement data.
            </p>
          </div>
        ) : (
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={data} margin={{ left: -14, right: 8, top: 4 }}>
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillInteractions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-interactions)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-interactions)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={28}
              tickFormatter={(value: string) => formatDateShort(value)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={6} width={38} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDateShort(String(value))}
                />
              }
            />
            <Area
              dataKey="views"
              type="monotone"
              fill="url(#fillViews)"
              stroke="var(--color-views)"
              strokeWidth={1.75}
            />
            <Area
              dataKey="interactions"
              type="monotone"
              fill="url(#fillInteractions)"
              stroke="var(--color-interactions)"
              strokeWidth={1.75}
            />
          </AreaChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
