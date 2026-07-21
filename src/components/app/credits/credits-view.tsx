"use client";

import {
  CircleMinus,
  Coins,
  Gift,
  RotateCcw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { RelativeTime } from "@/components/shared/relative-time";
import { BuyCreditsDialog } from "@/components/app/credits/buy-credits-dialog";
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
import { useSimulation } from "@/lib/simulation/provider";
import { cn } from "@/lib/utils";
import type {
  CreditEntry,
  CreditEntryType,
  CreditPack,
  Workspace,
} from "@/lib/types";

const ENTRY_META: Record<CreditEntryType, { icon: LucideIcon; color: string }> = {
  generation: { icon: CircleMinus, color: "text-muted-foreground" },
  refund: { icon: RotateCcw, color: "text-warning" },
  pack_purchase: { icon: Coins, color: "text-success" },
  bonus: { icon: Gift, color: "text-brand" },
};

export function CreditsView({
  workspace,
  ledger,
  packs,
}: {
  workspace: Workspace;
  ledger: CreditEntry[];
  packs: CreditPack[];
}) {
  const sim = useSimulation();
  // Wallet totals stay live as the demo user renders and buys credits.
  const totalPurchased = workspace.totalPurchased + sim.creditsPurchased;
  const creditsUsed = workspace.creditsUsed + sim.creditsUsed;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-muted-foreground">Current balance</p>
              <p className="mt-1 text-5xl font-semibold tracking-tight">
                <AnimatedNumber value={sim.creditsBalance} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Credits never expire · each render consumes 1 credit
              </p>
            </div>
            <div className="w-full sm:w-56">
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Total purchased</dt>
                  <dd className="font-medium tabular-nums">{totalPurchased}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Credits used</dt>
                  <dd className="font-medium tabular-nums">{creditsUsed}</dd>
                </div>
              </dl>
              <div className="mt-4 flex justify-end">
                <BuyCreditsDialog packs={packs} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What a credit buys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm text-muted-foreground">
            {[
              "Interactive 360° viewer + embed",
              "Seamless orbit video up to 4K",
              "72 studio frames at 3840×3840",
              "6-platform marketplace set (Amazon, Shopify, Etsy, Wayfair, Trendyol, Hepsiburada)",
              "Compliance score per platform",
              "3D model add-on available (+7 credits)",
            ].map((line) => (
              <p key={line} className="flex items-center gap-2.5">
                <Sparkles className="size-3.5 text-brand" aria-hidden="true" />
                {line}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent usage</CardTitle>
          <CardDescription>
            Every purchase, render, and refund in your credit wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-card hover:bg-card">
                  <TableHead>Entry</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden text-right md:table-cell">
                    Balance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => {
                  const meta = ENTRY_META[entry.type];
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                            <meta.icon
                              className={cn("size-3.5", meta.color)}
                              aria-hidden="true"
                            />
                          </span>
                          <span className="max-w-96 truncate text-sm text-foreground">
                            {entry.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                        <RelativeTime iso={entry.createdAt} />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono text-sm tabular-nums",
                          entry.amount > 0 ? "text-success" : "text-foreground",
                        )}
                      >
                        {entry.amount > 0 ? `+${entry.amount}` : entry.amount}
                      </TableCell>
                      <TableCell className="hidden text-right font-mono text-sm text-muted-foreground tabular-nums md:table-cell">
                        {entry.balanceAfter}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
