"use client";

import * as React from "react";
import {
  CircleCheck,
  DollarSign,
  ExternalLink,
  MoreHorizontal,
  Receipt,
  RotateCcw,
  Search,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { PaymentBadge } from "@/components/admin/admin-badges";
import { KpiCard } from "@/components/admin/kpi-card";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/format";
import type { AdminOrderRow, PaymentStatus } from "@/lib/types";

const TABS: { value: PaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "succeeded", label: "Succeeded" },
  { value: "processing", label: "Processing" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

function OrderActions({
  order,
  onRefund,
}: {
  order: AdminOrderRow;
  onRefund: () => void;
}) {
  const [refundOpen, setRefundOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${order.id}`}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onSelect={() =>
              toast.info("Opening Stripe", {
                description: `${order.id} opens in the Stripe dashboard in production.`,
              })
            }
          >
            <ExternalLink aria-hidden="true" /> View in Stripe
          </DropdownMenuItem>
          {order.status === "failed" && (
            <DropdownMenuItem
              onSelect={() =>
                toast.success("Retry email sent", {
                  description: `${order.customer} received a payment retry link.`,
                })
              }
            >
              <RotateCcw aria-hidden="true" /> Send retry link
            </DropdownMenuItem>
          )}
          {order.status === "succeeded" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setRefundOpen(true)}
              >
                <Undo2 aria-hidden="true" /> Issue refund
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={refundOpen} onOpenChange={setRefundOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Refund {formatCurrency(order.amount)} to {order.customer}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The full charge for the {order.packName} pack is returned to the
              original payment method and {order.credits} credit
              {order.credits === 1 ? " is" : "s are"} removed from the wallet.
              Stripe fees are not returned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                onRefund();
                toast.success("Refund issued", {
                  description: `${order.id} · ${formatCurrency(order.amount)} back to ${order.customer}.`,
                });
              }}
            >
              Issue refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function OrdersView({ initial }: { initial: AdminOrderRow[] }) {
  const [orders, setOrders] = React.useState(initial);
  const [tab, setTab] = React.useState<PaymentStatus | "all">("all");
  const [query, setQuery] = React.useState("");

  const grossVolume = orders
    .filter((o) => o.status === "succeeded")
    .reduce((sum, o) => sum + o.amount, 0);
  const succeededCount = orders.filter((o) => o.status === "succeeded").length;
  const refundedVolume = orders
    .filter((o) => o.status === "refunded")
    .reduce((sum, o) => sum + o.amount, 0);
  const failedCount = orders.filter((o) => o.status === "failed").length;

  const filtered = orders.filter((order) => {
    const matchesTab = tab === "all" || order.status === tab;
    const matchesQuery =
      query.trim() === "" ||
      `${order.customer} ${order.id} ${order.packName}`
        .toLowerCase()
        .includes(query.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const refund = (id: string) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "refunded" } : o)),
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Gross volume"
          value={
            <AnimatedNumber
              value={grossVolume}
              format={(v) => formatCurrency(v)}
            />
          }
          hint="Succeeded purchases shown below"
          icon={DollarSign}
        />
        <KpiCard
          label="Succeeded"
          value={<AnimatedNumber value={succeededCount} />}
          hint="Settled Stripe payments"
          icon={CircleCheck}
        />
        <KpiCard
          label="Refunded"
          value={
            <AnimatedNumber
              value={refundedVolume}
              format={(v) => formatCurrency(v)}
            />
          }
          hint="Returned to customers"
          icon={Undo2}
        />
        <KpiCard
          label="Failed payments"
          value={<AnimatedNumber value={failedCount} />}
          hint="Declined · dunning email sent"
          icon={TriangleAlert}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as PaymentStatus | "all")}
          >
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customer or payment id…"
              className="w-full pl-8 lg:w-72"
              aria-label="Search orders"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No orders match"
            description="Try a different search or switch payment status."
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
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
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
                    <TableCell className="text-right">
                      <OrderActions
                        order={order}
                        onRefund={() => refund(order.id)}
                      />
                    </TableCell>
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
