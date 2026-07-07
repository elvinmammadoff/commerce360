"use client";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Admin action: suspend or reactivate a customer account (simulated).
 * Controlled (`open`/`onOpenChange`) so dropdown menus can launch it, or
 * uncontrolled with a `trigger`.
 */
export function SuspendAccountDialog({
  company,
  suspended,
  onConfirm,
  open,
  onOpenChange,
  trigger,
}: {
  company: string;
  /** Current state — true renders the dialog in "reactivate" mode. */
  suspended: boolean;
  onConfirm: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}) {
  function confirm() {
    onConfirm();
    if (suspended) {
      toast.success("Account reactivated", {
        description: `${company} can sign in and render again.`,
      });
    } else {
      toast.success("Account suspended", {
        description: `${company} is locked out; queued jobs were cancelled.`,
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {suspended ? `Reactivate ${company}?` : `Suspend ${company}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {suspended
              ? "The account regains full access: sign-in, rendering, and purchases. Its credit balance is untouched."
              : "The account is locked immediately: sign-in is blocked, queued jobs are cancelled and refunded, and live share pages stay online. Credits are kept and restored on reactivation."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={
              suspended
                ? undefined
                : "bg-destructive text-white hover:bg-destructive/90"
            }
            onClick={confirm}
          >
            {suspended ? "Reactivate account" : "Suspend account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
