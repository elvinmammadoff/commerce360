"use client";

import { CreditCard, Download, Receipt } from "lucide-react";
import { toast } from "sonner";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { BuyCreditsDialog } from "@/components/app/credits/buy-credits-dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { useSimulation } from "@/lib/simulation/provider";
import type {
  CreditPack,
  PaymentMethod,
  PaymentStatus,
  Purchase,
  Workspace,
} from "@/lib/types";

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  succeeded: "border-success/25 bg-success/10 text-success",
  processing: "border-warning/25 bg-warning/10 text-warning",
  refunded: "border-border bg-muted/40 text-muted-foreground",
  failed: "border-destructive/25 bg-destructive/10 text-destructive",
};

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  succeeded: "Succeeded",
  processing: "Processing",
  refunded: "Refunded",
  failed: "Failed",
};

export function BillingView({
  workspace,
  packs,
  purchases,
  paymentMethod,
}: {
  workspace: Workspace;
  packs: CreditPack[];
  purchases: Purchase[];
  paymentMethod: PaymentMethod | null;
}) {
  const sim = useSimulation();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                Credit wallet
                <Badge variant="outline" className="border-success/25 bg-success/10 text-success">
                  No subscription
                </Badge>
              </CardTitle>
              <CardDescription>
                One-time credits · never expire · 1 credit per render
              </CardDescription>
            </div>
            <BuyCreditsDialog packs={packs} />
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Available</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                  <AnimatedNumber value={sim.creditsBalance} />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Purchased</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                  {workspace.totalPurchased + sim.creditsPurchased}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Used</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                  {workspace.creditsUsed + sim.creditsUsed}
                </dd>
              </div>
            </dl>
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
            {paymentMethod ? (
              <div>
                <p className="text-sm font-medium capitalize">
                  {paymentMethod.brand} ·· {paymentMethod.last4}
                </p>
                <p className="text-xs text-muted-foreground">
                  Expires {String(paymentMethod.expMonth).padStart(2, "0")}/
                  {paymentMethod.expYear}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No card on file</p>
            )}
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
          <CardTitle>Purchase history</CardTitle>
          <CardDescription>
            One-time credit purchases on this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-card hover:bg-card">
                  <TableHead>Credit pack</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Purchase date
                  </TableHead>
                  <TableHead className="text-right">Payment status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{purchase.packName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {purchase.id}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      +{purchase.credits}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatCurrency(purchase.amount)}
                    </TableCell>
                    <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                      {formatDate(purchase.purchasedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={PAYMENT_BADGE[purchase.status]}
                      >
                        {PAYMENT_LABEL[purchase.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {purchase.status === "succeeded" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Download receipt for ${purchase.packName}`}
                          onClick={() =>
                            toast.success("Receipt downloading", {
                              description: `${purchase.id}.pdf`,
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
            Receipts are issued by Orbittify, Inc. and settle in USD via
            Stripe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
