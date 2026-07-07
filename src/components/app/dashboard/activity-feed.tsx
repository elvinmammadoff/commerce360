import Link from "next/link";
import {
  CircleAlert,
  CircleCheck,
  Coins,
  Download,
  KeyRound,
  Play,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { RelativeTime } from "@/components/shared/relative-time";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivityEvent, ActivityType } from "@/lib/types";

const TYPE_META: Record<ActivityType, { icon: LucideIcon; color: string }> = {
  generation_started: { icon: Play, color: "text-brand" },
  generation_completed: { icon: CircleCheck, color: "text-success" },
  generation_failed: { icon: CircleAlert, color: "text-destructive" },
  download: { icon: Download, color: "text-muted-foreground" },
  member_invited: { icon: UserPlus, color: "text-muted-foreground" },
  api_key_created: { icon: KeyRound, color: "text-muted-foreground" },
  credits_added: { icon: Coins, color: "text-success" },
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Everything that happened recently</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="relative space-y-0.5 before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-px before:bg-border">
          {events.map((event) => {
            const meta = TYPE_META[event.type];
            const row = (
              <span className="flex items-start gap-3">
                <span className="relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                  <meta.icon
                    className={cn("size-3.5", meta.color)}
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0 flex-1 pt-1">
                  <span className="block text-[13px] leading-snug text-foreground">
                    {event.message}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    <RelativeTime iso={event.createdAt} />
                  </span>
                </span>
              </span>
            );
            return (
              <li key={event.id}>
                {event.href ? (
                  <Link
                    href={event.href}
                    className="block rounded-lg p-1.5 transition-colors duration-150 hover:bg-accent"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="p-1.5">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
