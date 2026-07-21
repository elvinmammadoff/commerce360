import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Reveal } from "@/components/marketing/reveal";

const FOOTER_COLUMNS = [
  {
    label: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "API", href: "/api" },
    ],
  },
  {
    label: "Customers",
    links: [
      { label: "Testimonials", href: "/#testimonials" },
      { label: "Furniture brands", href: "/#features" },
      { label: "Electronics", href: "/#features" },
      { label: "Agencies", href: "/#features" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Documentation", href: "/api" },
      { label: "FAQ", href: "/#faq" },
      { label: "Support", href: "mailto:support@orbittify.com" },
      { label: "Sales", href: "mailto:sales@orbittify.com" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
      { label: "DPA", href: "/#" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="relative bg-white/[0.015]">
      <div aria-hidden="true" className="divider-glow absolute inset-x-0 top-0" />
      <Reveal className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Generate premium product visuals from a single photo — 360°
              viewers, orbit videos, and marketplace-ready image sets.
            </p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              All systems operational
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.label} aria-label={column.label}>
              <p className="text-sm font-medium text-foreground">{column.label}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.label}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="-mx-1 rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Orbittify, Inc. All rights reserved.</p>
          <p>Built for teams that ship catalogs, not photoshoots.</p>
        </div>
      </Reveal>
    </footer>
  );
}
