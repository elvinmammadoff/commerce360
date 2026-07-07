"use client";

import * as React from "react";
import { Coins } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { useSimulation } from "@/lib/simulation/provider";
import { cn } from "@/lib/utils";
import type { CreditPack } from "@/lib/types";

/**
 * One-time credit purchase dialog. Buys a credit pack via (simulated) Stripe
 * checkout and adds the credits to the wallet — no subscription.
 * Pass a custom `trigger`; otherwise a default "Buy credits" button renders.
 */
export function BuyCreditsDialog({
  packs,
  trigger,
}: {
  packs: CreditPack[];
  trigger?: React.ReactNode;
}) {
  const { purchaseCredits } = useSimulation();
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(
    packs.find((p) => p.highlighted)?.id ?? packs[0]?.id,
  );
  const [purchasing, setPurchasing] = React.useState(false);

  const pack = packs.find((p) => p.id === selected);

  const buy = () => {
    if (!pack || purchasing) return;
    setPurchasing(true);
    // Brief pause reads as a real Stripe payment round-trip.
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
        {trigger ?? (
          <Button size="sm">
            <Coins aria-hidden="true" /> Buy credits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy credits</DialogTitle>
          <DialogDescription>
            One-time purchase · credits never expire · secure Stripe checkout.
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
                  {p.name} · {p.credits}{" "}
                  {p.credits === 1 ? "credit" : "credits"}
                </span>
                {p.highlighted && (
                  <Badge className="bg-brand/15 text-brand" variant="outline">
                    Most popular
                  </Badge>
                )}
              </span>
              <span className="text-right">
                <span className="block text-sm font-medium">
                  {formatCurrency(p.price)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatCurrency(p.perProduct)}/product
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
