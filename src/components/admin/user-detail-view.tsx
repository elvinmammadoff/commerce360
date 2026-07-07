"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Ban, Coins, Receipt, ShoppingBag, Sparkles, UserCheck } from "lucide-react";

import { LedgerTypeBadge, PaymentBadge, UserStatusBadge } from "@/components/admin/admin-badges";
import { AdjustCreditsDialog } from "@/components/admin/adjust-credits-dialog";
import { KpiCard } from "@/components/admin/kpi-card";
import { SuspendAccountDialog } from "@/components/admin/suspend-account-dialog";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/format";
import type {
  AdminLedgerEntry,
  AdminOrderRow,
  AdminUserRow,
} from "@/lib/types";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserDetailView({
  initial,
  orders,
  ledger,
}: {
  initial: AdminUserRow;
  orders: AdminOrderRow[];
  ledger: AdminLedgerEntry[];
}) {
  const [user, setUser] = React.useState(initial);
  const suspended = user.status === "suspended";

  const adjustBalance = (delta: number) =>
    setUser((prev) => ({
      ...prev,
      creditBalance: prev.creditBalance + delta,
      creditsPurchased:
        delta > 0 ? prev.creditsPurchased + delta : prev.creditsPurchased,
    }));

  const toggleSuspend = () =>
    setUser((prev) => ({
      ...prev,
      status: prev.status === "suspended" ? "active" : "suspended",
    }));

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/admin/users">
            <ArrowLeft aria-hidden="true" /> All users
          </Link>
        </Button>
      </div>

      {/* Profile header */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-secondary text-lg font-medium">
                {initialsOf(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">
                  {user.company}
                </h2>
                <UserStatusBadge status={user.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {user.name} · {user.email}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {user.id} · customer since {formatDate(user.joinedAt)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AdjustCreditsDialog
              company={user.company}
              balance={user.creditBalance}
              onAdjust={adjustBalance}
            />
            <SuspendAccountDialog
              company={user.company}
              suspended={suspended}
              onConfirm={toggleSuspend}
              trigger={
                suspended ? (
                  <Button variant="outline" size="sm">
                    <UserCheck aria-hidden="true" /> Reactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Ban aria-hidden="true" /> Suspend
                  </Button>
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Wallet KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Credit balance"
          value={<AnimatedNumber value={user.creditBalance} />}
          hint="Available to spend · never expires"
          icon={Coins}
        />
        <KpiCard
          label="Credits purchased"
          value={<AnimatedNumber value={user.creditsPurchased} />}
          hint="Lifetime, settled purchases"
          icon={ShoppingBag}
        />
        <KpiCard
          label="Credits used"
          value={<AnimatedNumber value={user.creditsUsed} />}
          hint="1 credit = 1 render"
          icon={Sparkles}
        />
        <KpiCard
          label="Purchases"
          value={<AnimatedNumber value={user.purchases} />}
          hint="One-time Stripe payments"
          icon={Receipt}
        />
      </div>

      {/* Purchase history */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase history</CardTitle>
          <CardDescription>
            One-time credit pack purchases via Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No purchases yet"
              description="Recent one-time purchases for this account will appear here."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card hover:bg-card">
                    <TableHead>Payment</TableHead>
                    <TableHead className="hidden sm:table-cell">Pack</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="hidden text-right md:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {order.id}
                      </TableCell>
                      <TableCell className="hidden text-sm sm:table-cell">
                        {order.packName}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        +{order.credits}
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
          )}
        </CardContent>
      </Card>

      {/* Usage history */}
      <Card>
        <CardHeader>
          <CardTitle>Usage history</CardTitle>
          <CardDescription>
            Wallet ledger — renders, refunds, bonuses, and manual adjustments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ledger.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No usage yet"
              description="Credit activity for this account will appear here."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card hover:bg-card">
                    <TableHead>Activity</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden text-right md:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        {entry.description}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <LedgerTypeBadge type={entry.type} />
                      </TableCell>
                      <TableCell className="hidden text-right text-sm whitespace-nowrap text-muted-foreground md:table-cell">
                        {formatDateTime(entry.createdAt)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono text-sm tabular-nums",
                          entry.amount > 0 && "text-success",
                        )}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {formatNumber(entry.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
