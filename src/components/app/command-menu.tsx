"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Coins, Globe, Package, Plus, Search, UserPlus } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { APP_NAV } from "@/lib/navigation";
import { useSimulation } from "@/lib/simulation/provider";
import type { Product } from "@/lib/types";

export function CommandMenu({ products }: { products: Product[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { products: simProducts } = useSimulation();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = React.useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [],
  );

  const allProducts = [...simProducts, ...products];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full max-w-56 justify-between gap-2 text-muted-foreground sm:flex"
        aria-label="Search (Command K)"
      >
        <span className="flex items-center gap-2">
          <Search aria-hidden="true" />
          Search…
        </span>
        <kbd className="pointer-events-none hidden rounded border border-border bg-muted px-1.5 py-px font-mono text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Command menu">
        <CommandInput placeholder="Search pages, products, actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => run(() => router.push("/upload"))}>
              <Plus aria-hidden="true" />
              New product
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push("/credits"))}>
              <Coins aria-hidden="true" />
              Buy credits
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push("/settings"))}>
              <UserPlus aria-hidden="true" />
              Invite teammate
            </CommandItem>
            <CommandItem onSelect={() => run(() => router.push("/"))}>
              <Globe aria-hidden="true" />
              Open marketing site
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Go to">
            {APP_NAV.flatMap((group) => group.items).map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => run(() => router.push(item.href))}
              >
                <item.icon aria-hidden="true" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Products">
            {allProducts.slice(0, 6).map((product) => (
              <CommandItem
                key={product.id}
                value={`${product.name} ${product.sku}`}
                onSelect={() => run(() => router.push(`/products/${product.id}`))}
              >
                <Package aria-hidden="true" />
                <span className="truncate">{product.name}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {product.sku}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
