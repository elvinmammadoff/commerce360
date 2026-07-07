"use client";

import * as React from "react";
import { Coins, Plus, Scale, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard } from "@/components/admin/kpi-card";
import { AnimatedNumber } from "@/components/shared/animated-number";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  formatCompact,
  formatDate,
  formatDateShort,
  formatNumber,
} from "@/lib/format";
import type {
  AdminAdjustment,
  AdminStats,
  AdminUserRow,
  DailyRenderPoint,
  RevenuePoint,
} from "@/lib/types";

const salesConfig = {
  creditsSold: {
    label: "Credits sold",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const usageConfig = {
  renders: {
    label: "Credits used",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/** Admin action: record a manual wallet adjustment for any customer. */
function NewAdjustmentDialog({
  users,
  onCreate,
}: {
  users: AdminUserRow[];
  onCreate: (adjustment: AdminAdjustment) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [userId, setUserId] = React.useState(users[0]?.id ?? "");
  const [amount, setAmount] = React.useState("10");
  const [direction, setDirection] = React.useState<"grant" | "deduct">("grant");
  const [reason, setReason] = React.useState("");
  const amountId = React.useId();
  const reasonId = React.useId();

  function submit() {
    const user = users.find((u) => u.id === userId);
    const n = Number(amount);
    if (!user) {
      toast.error("Pick a customer");
      return;
    }
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      toast.error("Enter a whole number of credits");
      return;
    }
    if (reason.trim().length < 4) {
      toast.error("Add a short reason — it is logged to the ledger");
      return;
    }
    const delta = direction === "grant" ? n : -n;
    if (direction === "deduct" && user.creditBalance + delta < 0) {
      toast.error("Balance cannot go below zero", {
        description: `${user.company} has ${user.creditBalance} credits.`,
      });
      return;
    }
    onCreate({
      id: `adj_${Math.floor(1000 + Math.random() * 9000)}`,
      customer: user.company,
      amount: delta,
      reason: reason.trim(),
      admin: "Jonas Weber",
      createdAt: new Date().toISOString(),
    });
    toast.success(
      `${direction === "grant" ? "Granted" : "Deducted"} ${n} credit${n === 1 ? "" : "s"}`,
      { description: `${user.company} · logged to the credit ledger` },
    );
    setOpen(false);
    setReason("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" /> New adjustment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manual credit adjustment</DialogTitle>
          <DialogDescription>
            Grants and deductions post to the customer&apos;s wallet instantly
            and are logged with your name.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="w-full" aria-label="Customer">
                  <SelectValue placeholder="Pick a customer" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={direction}
                onValueChange={(v) => setDirection(v as "grant" | "deduct")}
              >
                <SelectTrigger className="w-full" aria-label="Direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grant">Grant credits</SelectItem>
                  <SelectItem value="deduct">Deduct credits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={amountId}>Amount</Label>
            <Input
              id={amountId}
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={reasonId}>Reason</Label>
            <Textarea
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Goodwill grant — failed batch on Jul 2"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Post adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreditsView({
  stats,
  revenue,
  usage,
  adjustments: initialAdjustments,
  users,
}: {
  stats: AdminStats;
  revenue: RevenuePoint[];
  usage: DailyRenderPoint[];
  adjustments: AdminAdjustment[];
  users: AdminUserRow[];
}) {
  const [adjustments, setAdjustments] = React.useState(initialAdjustments);
  const adjustmentsNet = adjustments.reduce((sum, a) => sum + a.amount, 0);
  const outstanding = stats.creditsSold - stats.creditsUsed;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          label="Outstanding balance"
          value={<AnimatedNumber value={outstanding} />}
          hint="Sitting in customer wallets"
          icon={Wallet}
        />
        <KpiCard
          label="Manual adjustments"
          value={
            <AnimatedNumber
              value={adjustmentsNet}
              format={(v) => `${v > 0 ? "+" : ""}${formatNumber(v)}`}
            />
          }
          hint="Net credits, staff grants − deductions"
          icon={Scale}
        />
      </div>

      {/* Sales + usage */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Credit sales</CardTitle>
            <CardDescription>Credits sold by month, 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesConfig} className="h-64 w-full">
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

        <Card>
          <CardHeader>
            <CardTitle>Credit usage</CardTitle>
            <CardDescription>
              Credits consumed per day — last 14 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={usageConfig} className="h-64 w-full">
              <AreaChart data={usage} margin={{ left: -8, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="fillUsage" x1="0" y1="0" x2="0" y2="1">
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
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={24}
                  tickFormatter={(v: string) => formatDateShort(v)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
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
                          {formatNumber(Number(value))} credits
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="renders"
                  type="natural"
                  fill="url(#fillUsage)"
                  stroke="var(--color-renders)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Manual adjustments */}
      <Card>
        <CardHeader>
          <CardTitle>Manual adjustments</CardTitle>
          <CardDescription>
            Staff grants and deductions, logged to each customer&apos;s ledger
          </CardDescription>
          <CardAction>
            <NewAdjustmentDialog
              users={users}
              onCreate={(adjustment) =>
                setAdjustments((prev) => [adjustment, ...prev])
              }
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-card hover:bg-card">
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">
                    By
                  </TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {adjustment.customer}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {adjustment.id}
                      </p>
                    </TableCell>
                    <TableCell className="hidden max-w-xs text-sm text-muted-foreground md:table-cell">
                      <span className="line-clamp-1">{adjustment.reason}</span>
                    </TableCell>
                    <TableCell className="hidden text-right text-sm whitespace-nowrap text-muted-foreground lg:table-cell">
                      {adjustment.admin}
                    </TableCell>
                    <TableCell className="hidden text-right text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                      {formatDate(adjustment.createdAt)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono text-sm tabular-nums",
                        adjustment.amount > 0
                          ? "text-success"
                          : "text-destructive",
                      )}
                    >
                      {adjustment.amount > 0 ? "+" : ""}
                      {formatNumber(adjustment.amount)}
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
