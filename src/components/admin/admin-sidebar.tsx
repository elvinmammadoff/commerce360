"use client";

import { SidebarNav } from "@/components/app/app-sidebar";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/lib/navigation";

/**
 * Live platform pulse pinned to the sidebar footer — the admin counterpart
 * of the customer credit wallet card.
 */
export function SidebarSystemStatus({ pendingJobs }: { pendingJobs: number }) {
  return (
    <div className="mx-3 mb-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
      <div className="flex items-center gap-2">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-success" />
        </span>
        <p className="text-xs font-medium text-foreground">
          All systems operational
        </p>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {pendingJobs} jobs in the render queue
      </p>
    </div>
  );
}

export function AdminBadge() {
  return (
    <Badge
      variant="outline"
      className="border-warning/25 bg-warning/10 text-warning"
    >
      Admin
    </Badge>
  );
}

export function AdminSidebar({ pendingJobs }: { pendingJobs: number }) {
  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        <Logo href="/admin" />
        <AdminBadge />
      </div>
      <SidebarNav groups={ADMIN_NAV} />
      <SidebarSystemStatus pendingJobs={pendingJobs} />
    </aside>
  );
}
