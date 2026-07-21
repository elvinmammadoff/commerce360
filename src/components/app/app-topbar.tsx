"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code2,
  CreditCard,
  Globe,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { CommandMenu } from "@/components/app/command-menu";
import { NotificationsPopover } from "@/components/app/notifications-popover";
import { SidebarCredits, SidebarNav } from "@/components/app/app-sidebar";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useUser } from "@/lib/user-context";
import type {
  NotificationItem,
  Product,
  Workspace,
} from "@/lib/types";

export function AppTopbar({
  workspace,
  notifications,
  products,
}: {
  workspace: Workspace;
  notifications: NotificationItem[];
  products: Product[];
}) {
  const { user } = useUser();
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
            <SheetTitle>
              <Logo href="/dashboard" />
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-hidden">
            <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            <SidebarCredits workspace={workspace} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <CommandMenu products={products} />
      </div>

      <Button asChild size="sm" className="hidden gap-1.5 sm:inline-flex">
        <Link href="/upload">
          <Plus aria-hidden="true" />
          New product
        </Link>
      </Button>

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
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
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
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <Settings aria-hidden="true" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/billing")}>
              <CreditCard aria-hidden="true" /> Billing
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/api")}>
              <Code2 aria-hidden="true" /> API keys
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {/* Role-gated: customers never see the admin console entry. */}
          {user.appRole === "admin" && (
            <DropdownMenuItem onSelect={() => router.push("/admin")}>
              <ShieldCheck aria-hidden="true" /> Admin console
            </DropdownMenuItem>
          )}
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
