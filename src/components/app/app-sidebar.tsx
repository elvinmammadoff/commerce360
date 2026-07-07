"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { APP_NAV, type NavGroup } from "@/lib/navigation";
import { useSimulation } from "@/lib/simulation/provider";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/lib/types";

export function SidebarNav({
  groups = APP_NAV,
  onNavigate,
}: {
  groups?: NavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-2.5 pb-2 text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm text-sidebar-foreground transition-colors duration-150 outline-none",
                      "hover:bg-sidebar-accent hover:text-foreground",
                      "focus-visible:ring-3 focus-visible:ring-ring/50",
                      active && "bg-sidebar-accent font-medium text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-4 text-muted-foreground",
                        active && "text-brand",
                      )}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function SidebarCredits({ workspace }: { workspace: Workspace }) {
  const { creditsBalance, creditsPurchased } = useSimulation();
  // Wallet fill: how much of the lifetime purchased credits remain.
  const totalPurchased = workspace.totalPurchased + creditsPurchased;
  const pct =
    totalPurchased > 0
      ? Math.min(100, Math.round((creditsBalance / totalPurchased) * 100))
      : 0;

  return (
    <div className="mx-3 mb-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-muted-foreground">Credits</p>
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {creditsBalance}
          <span className="font-normal text-muted-foreground"> left</span>
        </p>
      </div>
      <Progress
        value={pct}
        className="mt-2 h-1"
        aria-label={`${creditsBalance} credits remaining`}
      />
      <Button
        asChild
        variant="outline"
        size="sm"
        className="mt-3 w-full"
      >
        <Link href="/credits">Buy credits</Link>
      </Button>
    </div>
  );
}

export function AppSidebar({ workspace }: { workspace: Workspace }) {
  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Logo href="/dashboard" />
      </div>
      <div className="px-3 pt-3">
        <Button asChild size="sm" className="w-full justify-start gap-2">
          <Link href="/upload">
            <Plus aria-hidden="true" />
            New product
          </Link>
        </Button>
      </div>
      <SidebarNav />
      <SidebarCredits workspace={workspace} />
    </aside>
  );
}
