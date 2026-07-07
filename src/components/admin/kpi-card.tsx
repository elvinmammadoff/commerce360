import { Card, CardContent } from "@/components/ui/card";

/**
 * Platform KPI tile — same visual language as the customer dashboard's
 * StatCard (icon chip, hover elevation), but takes rendered nodes so pages
 * can pass AnimatedNumber, currency formatting, or tinted hints.
 */
export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="hover:ring-foreground/20 hover:elevate-md">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="flex size-7 items-center justify-center rounded-lg bg-muted/60 ring-1 ring-inset ring-border/60">
            <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </span>
        </div>
        <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
