"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MARKETING_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
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
      {/* Hairline brand glow that fades in with the scrolled chrome. */}
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
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="border-transparent bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] text-white shadow-[0_6px_20px_-6px_rgba(124,92,246,0.65)] hover:text-white hover:shadow-[0_8px_26px_-6px_rgba(124,92,246,0.85)]"
          >
            <Link href="/login">
              Start free <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
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
              <Button asChild variant="outline">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button
                asChild
                className="border-transparent bg-linear-to-r from-[#5B8CFF] to-[#8B5CF6] text-white hover:text-white"
              >
                <Link href="/login" onClick={() => setOpen(false)}>
                  Start free
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>
    </header>
  );
}
