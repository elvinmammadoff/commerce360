"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginAction, registerAction } from "@/lib/auth-actions";
import type { AppRole } from "@/lib/types";

type AuthMode = "login" | "signup";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        d="M21.6 12.23c0-.68-.06-1.36-.19-2.02H12v3.83h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.22c1.89-1.74 2.98-4.3 2.98-7.33Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.5c2.7 0 4.96-.9 6.62-2.42l-3.23-2.5c-.9.6-2.05.94-3.39.94-2.6 0-4.8-1.76-5.6-4.12H3.08v2.58A10 10 0 0 0 12 21.5Z"
        fill="#34A853"
      />
      <path
        d="M6.4 13.4a6 6 0 0 1 0-3.8V7.02H3.08a10 10 0 0 0 0 8.96L6.4 13.4Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.48c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.97 9.97 0 0 0 12 2.5a10 10 0 0 0-8.92 5.52L6.4 10.6c.8-2.36 3-4.12 5.6-4.12Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm({
  mode = "login",
  role = "customer",
  next,
}: {
  mode?: AuthMode;
  role?: AppRole;
  next?: string;
}) {
  const isSignup = mode === "signup";
  const activeRole = isSignup ? "customer" : role;

  const action = isSignup ? registerAction : loginAction;
  const [error, formAction, isPending] = React.useActionState(action, null);

  React.useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="space-y-5">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isPending}
        onClick={() => toast.info("Google SSO coming soon")}
      >
        <GoogleMark />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form className="space-y-4" action={formAction}>
        <input type="hidden" name="role" value={activeRole} />
        {next && <input type="hidden" name="next" value={next} />}

        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isSignup && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                onClick={() =>
                  toast.info("Reset link sent", {
                    description: "Check your inbox for the password reset email.",
                  })
                }
              >
                Forgot password?
              </button>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="••••••••••"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {isSignup
            ? isPending
              ? "Creating account…"
              : "Create account"
            : isPending
              ? "Signing in…"
              : role === "admin"
                ? "Sign in to admin"
                : "Sign in"}
        </Button>
      </form>

      {role === "admin" ? (
        <p className="text-center text-sm text-muted-foreground">
          Not staff?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Customer sign in
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to Commerce360?{" "}
              <Link
                href="/signup"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
