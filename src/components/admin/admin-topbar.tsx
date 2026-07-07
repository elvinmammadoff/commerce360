"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, LayoutDashboard, LogOut, Menu, Settings } from "lucide-react";

import { AdminBadge, SidebarSystemStatus } from "@/components/admin/admin-sidebar";
import { NotificationsPopover } from "@/components/app/notifications-popover";
import { SidebarNav } from "@/components/app/app-sidebar";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "@/lib/auth-actions";
import { ADMIN_NAV } from "@/lib/navigation";
import type { CurrentUser, NotificationItem } from "@/lib/types";

export function AdminTopbar({
  user,
  notifications,
  pendingJobs,
}: {
  user: CurrentUser;
  notifications: NotificationItem[];
  pendingJobs: number;
}) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetHeader className="border-b border-sidebar-border px-4 py-3">
            <SheetTitle className="flex items-center justify-between">
              <Logo href="/admin" />
              <AdminBadge />
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-hidden">
            <SidebarNav
              groups={ADMIN_NAV}
              onNavigate={() => setMobileNavOpen(false)}
            />
            <SidebarSystemStatus pendingJobs={pendingJobs} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center gap-2">
        <span className="hidden text-sm font-medium sm:inline">
          Platform admin
        </span>
        <span className="hidden text-sm text-muted-foreground md:inline">
          · internal operations console
        </span>
      </div>

      <NotificationsPopover initial={notifications} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Account menu"
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-secondary text-xs font-medium">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs font-normal text-muted-foreground">
              {user.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => router.push("/admin/settings")}>
              <Settings aria-hidden="true" /> Admin settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/dashboard")}>
              <LayoutDashboard aria-hidden="true" /> Customer workspace
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/")}>
            <Globe aria-hidden="true" /> Marketing site
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void signOut()}>
            <LogOut aria-hidden="true" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
