import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted motion-reduce:animate-pulse",
        className,
      )}
      {...props}
    >
      {/* Light sweep — motion-safe only */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent motion-safe:animate-[skeleton-sheen_1.8s_ease-in-out_infinite]"
      />
    </div>
  )
}

export { Skeleton }
