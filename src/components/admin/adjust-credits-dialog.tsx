"use client";

import * as React from "react";
import { Coins, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Admin action: grant or deduct credits on a customer's wallet (simulated).
 * `onAdjust` lets the parent view update its local copy of the balance.
 */
export function AdjustCreditsDialog({
  company,
  balance,
  onAdjust,
  trigger,
}: {
  company: string;
  balance: number;
  onAdjust?: (delta: number) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("10");
  const inputId = React.useId();

  function submit(direction: 1 | -1) {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      toast.error("Enter a whole number of credits");
      return;
    }
    const delta = direction * n;
    const nextBalance = balance + delta;
    if (nextBalance < 0) {
      toast.error("Balance cannot go below zero", {
        description: `${company} has ${balance} credits.`,
      });
      return;
    }
    onAdjust?.(delta);
    toast.success(
      `${delta > 0 ? "Added" : "Removed"} ${n} credit${n === 1 ? "" : "s"}`,
      { description: `${company} · new balance ${nextBalance}` },
    );
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Coins aria-hidden="true" /> Credits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust credits</DialogTitle>
          <DialogDescription>
            {company} · current balance{" "}
            <span className="font-medium text-foreground tabular-nums">
              {balance}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={inputId}>Amount</Label>
          <Input
            id={inputId}
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Manual grants and deductions are logged to the customer&apos;s
            credit ledger.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => submit(-1)}>
            <Minus aria-hidden="true" /> Remove
          </Button>
          <Button onClick={() => submit(1)}>
            <Plus aria-hidden="true" /> Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
