import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

import { LoginForm } from "@/components/marketing/login-form";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Create your account",
};

const FREE_CREDIT_INCLUDES = [
  "1 complete pipeline render",
  "4K video",
  "72 frames",
  "Public share page",
];

export default function SignupPage() {
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get 1 free credit instantly.
            <br />
            No credit card required.
          </p>
          <div className="mt-8">
            <LoginForm mode="signup" />
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card/50 p-4">
            <p className="text-xs font-medium text-foreground">
              Your free credit includes:
            </p>
            <ul className="mt-3 space-y-2">
              {FREE_CREDIT_INCLUDES.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Check
                    className="size-3.5 shrink-0 text-brand"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          By creating an account you agree to our Terms and Privacy Policy.
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
            “From a single photo to PDP-ready assets in eleven minutes. Buy one
            credit, render one product — no subscription, ever.”
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted-foreground">
            One credit = one complete pipeline render.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
