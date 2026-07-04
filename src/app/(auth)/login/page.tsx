import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "@/components/marketing/login-form";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
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
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your workspace to keep rendering.
          </p>
          <div className="mt-8">
            <LoginForm />
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
            “We shot our entire spring collection without booking a camera. 214
            SKUs went live with 360° viewers in under two weeks.”
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-secondary text-sm font-medium">
                LV
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Linnea Voss</p>
              <p className="text-xs text-muted-foreground">
                E-commerce Director, Møbelhuset Nord
              </p>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
