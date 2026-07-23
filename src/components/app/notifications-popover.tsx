"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CircleAlert, CircleCheck, Info } from "lucide-react";

import { RelativeTime } from "@/components/shared/relative-time";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { apiJson } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/lib/types";

const TONE_ICON = {
  success: CircleCheck,
  info: Info,
  warning: CircleAlert,
} as const;

const TONE_COLOR = {
  success: "text-success",
  info: "text-brand",
  warning: "text-warning",
} as const;

export function NotificationsPopover({
  initial,
}: {
  initial: NotificationItem[];
}) {
  const [items, setItems] = React.useState(initial);
  const unread = items.filter((item) => !item.read).length;

  const markAllRead = async () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    await apiJson("/api/notifications/read-all", { method: "POST" }).catch(() => {});
  };

  const markOneRead = async (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, read: true } : item));
    await apiJson(`/api/notifications/${id}/read`, { method: "PATCH" }).catch(() => {});
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
        >
          <Bell aria-hidden="true" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand ring-2 ring-background"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-88 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => void markAllRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ul className="max-h-96 overflow-y-auto py-1">
          {items.length === 0 && (
            <li className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Bell className="size-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground">
                You&apos;ll see updates about your renders here.
              </p>
            </li>
          )}
          {items.map((item) => {
            const Icon = TONE_ICON[item.tone];
            const body = (
              <>
                <Icon
                  className={cn("mt-0.5 size-4 shrink-0", TONE_COLOR[item.tone])}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 space-y-0.5">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-[13px] text-foreground",
                        !item.read && "font-medium",
                      )}
                    >
                      {item.title}
                    </span>
                    {!item.read && (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-brand"
                        aria-label="Unread"
                      />
                    )}
                  </span>
                  <span className="line-clamp-2 block text-xs text-muted-foreground">
                    {item.body}
                  </span>
                  <span className="block text-[11px] text-muted-foreground/70">
                    <RelativeTime iso={item.createdAt} />
                  </span>
                </span>
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex gap-3 px-4 py-2.5 transition-colors hover:bg-accent"
                    onClick={() => !item.read && void markOneRead(item.id)}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex gap-3 px-4 py-2.5">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
        <Separator />
        <div className="p-1.5">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/history">View render history</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
