import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JobStatus, ProductStatus } from "@/lib/types";

type Status = ProductStatus | JobStatus;

const STATUS_CONFIG: Record<
  Status,
  { label: string; dot: string; badge: string; pulse?: boolean }
> = {
  completed: {
    label: "Completed",
    dot: "bg-success",
    badge: "border-success/25 bg-success/10 text-success",
  },
  processing: {
    label: "Processing",
    dot: "bg-brand",
    badge: "border-brand/25 bg-brand/10 text-brand",
    pulse: true,
  },
  running: {
    label: "Running",
    dot: "bg-brand",
    badge: "border-brand/25 bg-brand/10 text-brand",
    pulse: true,
  },
  queued: {
    label: "Queued",
    dot: "bg-warning",
    badge: "border-warning/25 bg-warning/10 text-warning",
  },
  failed: {
    label: "Failed",
    dot: "bg-destructive",
    badge: "border-destructive/25 bg-destructive/10 text-destructive",
  },
  draft: {
    label: "Draft",
    dot: "bg-muted-foreground",
    badge: "border-border bg-muted/40 text-muted-foreground",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", config.badge, className)}
    >
      <span className="relative flex size-1.5">
        {config.pulse && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
              config.dot,
            )}
          />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", config.dot)} />
      </span>
      {config.label}
    </Badge>
  );
}
