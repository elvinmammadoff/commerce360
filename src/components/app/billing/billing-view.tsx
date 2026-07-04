"use client";

import * as React from "react";
import { ArrowRight, Check, CreditCard, Download, Receipt } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  Plan,
  Workspace,
} from "@/lib/types";

const INVOICE_BADGE: Record<InvoiceStatus, string> = {
  paid: "border-success/25 bg-success/10 text-success",
  open: "border-warning/25 bg-warning/10 text-warning",
  upcoming: "border-border bg-muted/40 text-muted-foreground",
  refunded: "border-border bg-muted/40 text-muted-foreground",
};

function ChangePlanDialog({
  plans,
  currentPlanId,
}: {
  plans: Plan[];
  currentPlanId: string;
}) {
  const [open, setOpen] = React.useState(false);

  const choose = (plan: Plan) => {
    setOpen(false);
    if (plan.id === currentPlanId) return;
    if (plan.priceMonthly === null) {
      toast.info("Our sales team will reach out", {
        description: "Enterprise plans are tailored — expect an email today.",
      });
      return;
    }
    const isUpgrade =
      (plan.priceMonthly ?? 0) >
      (plans.find((p) => p.id === currentPlanId)?.priceMonthly ?? 0);
    toast.success(
      isUpgrade ? `Upgraded to ${plan.name}` : `Switching to ${plan.name}`,
      {
        description: isUpgrade
          ? "New limits are live now; we prorate the difference on your next invoice."
          : "The change takes effect at your next renewal on Jul 26.",
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Change plan <ArrowRight aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a plan</DialogTitle>
          <DialogDescription>
            Upgrades apply immediately with proration; downgrades apply at
            renewal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => choose(plan)}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors duration-150 outline-none",
                  "focus-visible:ring-3 focus-visible:ring-ring/50",
                  isCurrent
                    ? "border-brand/60 bg-brand/10"
                    : "border-border bg-card hover:border-muted-foreground/40",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{plan.name}</span>
                  {isCurrent && (
                    <Badge variant="outline" className="border-brand/40 text-brand">
                      Current
                    </Badge>
                  )}
                </span>
                <span className="text-2xl font-semibold tracking-tight">
                  {plan.priceMonthly !== null ? (
                    <>
                      {formatCurrency(plan.priceMonthly)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /mo
                      </span>
                    </>
                  ) : (
                    "Custom"
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {plan.creditsPerMonth !== null
                    ? `${plan.creditsPerMonth} credits · ${plan.videoResolution} video · ${plan.seats} seats`
                    : "Custom credit pools · white-label · SLA"}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BillingView({
  workspace,
  plans,
  invoices,
  paymentMethod,
}: {
  workspace: Workspace;
  plans: Plan[];
  invoices: Invoice[];
  paymentMethod: PaymentMethod;
}) {
  const currentPlan = plans.find((p) => p.id === workspace.plan);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                {currentPlan?.name} plan
                <Badge variant="outline" className="border-success/25 bg-success/10 text-success">
                  Active
                </Badge>
              </CardTitle>
              <CardDescription>
                {formatCurrency(currentPlan?.priceMonthly ?? 0)}/month · renews{" "}
                {formatDate(workspace.renewsAt)} ·{" "}
                {currentPlan?.creditsPerMonth} credits/month
              </CardDescription>
            </div>
            <ChangePlanDialog plans={plans} currentPlanId={workspace.plan} />
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {currentPlan?.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-14 items-center justify-center rounded-md border border-border bg-card">
              <CreditCard className="size-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium capitalize">
                {paymentMethod.brand} ·· {paymentMethod.last4}
              </p>
              <p className="text-xs text-muted-foreground">
                Expires {String(paymentMethod.expMonth).padStart(2, "0")}/
                {paymentMethod.expYear}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info("Card update", {
                  description:
                    "A secure Stripe portal session opens here in production.",
                })
              }
            >
              Update card
            </Button>
            <p className="text-xs text-muted-foreground">
              Billing email: billing@fernhaven.com
            </p>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Receipts for every charge on this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-card hover:bg-card">
                  <TableHead>Invoice</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.id}
                    </TableCell>
                    <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                      {formatDate(invoice.date)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {invoice.description}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn("capitalize", INVOICE_BADGE[invoice.status])}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.status === "paid" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Download ${invoice.id}`}
                          onClick={() =>
                            toast.success("Receipt downloading", {
                              description: `${invoice.id}.pdf`,
                            })
                          }
                        >
                          <Download />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Receipt className="size-3.5" aria-hidden="true" />
            Invoices are issued by Commerce360 AI, Inc. and settle in USD.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
