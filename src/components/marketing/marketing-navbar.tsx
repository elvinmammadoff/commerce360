"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUser } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MARKETING_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-actions";

export function MarketingNavbar({
  isLoggedIn = false,
  user = null,
}: {
  isLoggedIn?: boolean;
  user?: CurrentUser | null;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "ease-out-quart fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.06] bg-background/70 shadow-[inset_0_-1px_0_0_color-mix(in_oklch,white_5%,transparent)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "ease-out-quart pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "container-page ease-out-quart flex items-center justify-between transition-all duration-300",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Logo />

        <nav
          aria-label="Marketing"
          onMouseLeave={() => setHovered(null)}
          className="relative hidden items-center gap-0.5 md:flex"
        >
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHovered(item.href)}
              className="relative rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {hovered === item.href && (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 -z-10 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.06]"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              )}
              <span className="inline-flex items-center gap-1">
                {item.label}
                {item.label === "Product" && (
                  <ChevronDown className="size-3.5 opacity-70" aria-hidden="true" />
                )}
              </span>
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn && user ? (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  <Avatar className="size-7">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                    <AvatarFallback className="bg-secondary text-xs font-medium">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate font-medium text-foreground">{user.name}</span>
                  {dropdownOpen
                    ? <ChevronUp className="size-3.5 opacity-60" aria-hidden="true" />
                    : <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
                  }
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => void signOut()}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="border-transparent bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_6px_20px_-6px_rgba(124,92,246,0.65)] hover:text-white hover:shadow-[0_8px_26px_-6px_rgba(124,92,246,0.85)]"
              >
                <Link href="/signup">
                  Start free <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
              {MARKETING_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 p-4">
              {isLoggedIn && user ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2">
                    <Avatar className="size-8">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                      <AvatarFallback className="bg-secondary text-xs font-medium">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button asChild className="border-transparent bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] text-white hover:text-white">
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => void signOut()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="border-transparent bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] text-white hover:text-white"
                  >
                    <Link href="/signup" onClick={() => setOpen(false)}>
                      Start free
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>
    </header>
  );
}
