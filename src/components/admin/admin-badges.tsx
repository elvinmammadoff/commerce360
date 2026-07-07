import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  AdminLedgerType,
  AdminUserStatus,
  PaymentStatus,
} from "@/lib/types";

/** Shared status tints for the admin console — same palette as StatusBadge. */

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

export function PaymentBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(PAYMENT_BADGE[status], className)}>
      {PAYMENT_LABEL[status]}
    </Badge>
  );
}

const USER_STATUS_BADGE: Record<AdminUserStatus, string> = {
  active: "border-success/25 bg-success/10 text-success",
  inactive: "border-border bg-muted/40 text-muted-foreground",
  suspended: "border-destructive/25 bg-destructive/10 text-destructive",
};

export function UserStatusBadge({
  status,
  className,
}: {
  status: AdminUserStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", USER_STATUS_BADGE[status], className)}
    >
      {status}
    </Badge>
  );
}

const LEDGER_BADGE: Record<AdminLedgerType, string> = {
  render: "border-border bg-muted/40 text-muted-foreground",
  refund: "border-success/25 bg-success/10 text-success",
  bonus: "border-brand/25 bg-brand/10 text-brand",
  adjustment: "border-warning/25 bg-warning/10 text-warning",
};

const LEDGER_LABEL: Record<AdminLedgerType, string> = {
  render: "Render",
  refund: "Refund",
  bonus: "Bonus",
  adjustment: "Adjustment",
};

export function LedgerTypeBadge({
  type,
  className,
}: {
  type: AdminLedgerType;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(LEDGER_BADGE[type], className)}>
      {LEDGER_LABEL[type]}
    </Badge>
  );
}
