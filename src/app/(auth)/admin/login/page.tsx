import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/marketing/login-form";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Admin sign in",
  // Internal console — keep it out of search results and crawlers.
  robots: { index: false, follow: false },
};

/**
 * Internal admin sign-in. Intentionally unlinked from the marketing site and
 * public login. Reachable directly at /admin/login; the middleware whitelists
 * this path so staff can authenticate before the (admin) guard applies.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" />
            Staff access
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Admin console
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to the platform operations console.
          </p>
          <div className="mt-8">
            <LoginForm role="admin" next={next} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          By signing in you agree to our Terms and Privacy Policy.
        </p>
      </div>

      <div className="relative hidden overflow-hidden border-l border-border bg-[#070707] lg:block">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_320px_at_70%_20%,rgba(91,140,255,0.12),transparent)]"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -right-20 -bottom-28 size-96 text-foreground opacity-[0.06]"
        >
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(-18 100 100)" />
          <circle cx="178" cy="72" r="6" className="fill-brand" />
        </svg>

        <figure className="relative flex h-full flex-col justify-end p-12">
          <blockquote className="max-w-md text-xl leading-relaxed font-medium text-balance text-foreground/90">
            “Every render, order, and credit ledger across the platform — one
            console, full visibility.”
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted-foreground">
            Orbittify operations
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
