"use client";

import * as React from "react";

import { formatDateTime, formatRelative } from "@/lib/format";

/**
 * Renders an absolute date on the server, then switches to a live relative
 * time after mount — keeps SSR deterministic with no hydration mismatch.
 */
export function RelativeTime({ iso }: { iso: string }) {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <time dateTime={iso} title={formatDateTime(iso)}>
      {now === null ? formatDateTime(iso) : formatRelative(iso, now)}
    </time>
  );
}
