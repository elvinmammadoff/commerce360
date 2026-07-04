"use client";

import * as React from "react";
import {
  CircleMinus,
  CirclePlus,
  Coins,
  Gift,
  RotateCcw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AnimatedNumber } from "@/components/shared/animated-number";
import { RelativeTime } from "@/components/shared/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
  plan_grant: { icon: CirclePlus, color: "text-success" },
  pack_purchase: { icon: Coins, color: "text-success" },
  bonus: { icon: Gift, color: "text-brand" },
};

function BuyCreditsDialog({ packs }: { packs: CreditPack[] }) {
  const { purchaseCredits } = useSimulation();
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(
    packs.find((p) => p.bestValue)?.id ?? packs[0]?.id,
  );
  const [purchasing, setPurchasing] = React.useState(false);

  const pack = packs.find((p) => p.id === selected);

  const buy = () => {
    if (!pack || purchasing) return;
    setPurchasing(true);
    // Brief pause reads as a real payment round-trip.
    window.setTimeout(() => {
      purchaseCredits(pack.credits);
      setPurchasing(false);
      setOpen(false);
      toast.success(`${pack.credits} credits added`, {
        description: `${formatCurrency(pack.price)} charged to Visa ·· 4242.`,
      });
    }, 1100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Coins aria-hidden="true" /> Buy credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top up credits</DialogTitle>
          <DialogDescription>
            Packs never expire and stack on top of your monthly plan credits.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2" role="radiogroup" aria-label="Credit packs">
          {packs.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected === p.id}
              onClick={() => setSelected(p.id)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors duration-150 outline-none",
                "focus-visible:ring-3 focus-visible:ring-ring/50",
                selected === p.id
                  ? "border-brand/60 bg-brand/10"
                  : "border-border bg-card hover:border-muted-foreground/40",
              )}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular-nums">
                  {p.credits} credits
                </span>
                {p.bestValue && (
                  <Badge className="bg-brand/15 text-brand" variant="outline">
                    Best value
                  </Badge>
                )}
              </span>
              <span className="text-right">
                <span className="block text-sm font-medium">
                  {formatCurrency(p.price)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatCurrency(p.perCredit, true)}/credit
                </span>
              </span>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="w-full"
            onClick={buy}
            disabled={purchasing || !pack}
          >
            {purchasing
              ? "Processing payment…"
              : pack
                ? `Pay ${formatCurrency(pack.price)}`
                : "Select a pack"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
  const usedThisCycle = ledger
    .filter((e) => e.type === "generation")
    .reduce((sum, e) => sum + Math.abs(e.amount), 0) + sim.jobs.length;
  const refunded = ledger
    .filter((e) => e.type === "refund")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-muted-foreground">Available credits</p>
              <p className="mt-1 text-5xl font-semibold tracking-tight">
                <AnimatedNumber value={sim.creditsBalance} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                +{workspace.creditsPerMonth} on {formatDate(workspace.renewsAt)}{" "}
                with your Growth renewal · unused credits roll over
              </p>
            </div>
            <div className="w-full sm:w-56">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>This cycle</span>
                <span className="tabular-nums">
                  {usedThisCycle} used · {refunded} refunded
                </span>
              </div>
              <Progress
                value={Math.min(
                  100,
                  (usedThisCycle / workspace.creditsPerMonth) * 100,
                )}
                className="mt-2 h-1.5"
                aria-label="Credits used this cycle"
              />
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
              "72 studio frames at 5° steps",
              "Amazon / Shopify / Etsy set",
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
          <CardTitle>Ledger</CardTitle>
          <CardDescription>
            Every grant, spend, and refund in the workspace wallet
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
