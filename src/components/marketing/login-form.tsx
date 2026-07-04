"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState<"email" | "sso" | null>(null);

  const signIn = (method: "email" | "sso") => {
    if (pending) return;
    if (method === "email" && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setPending(method);
    // Small delay reads as a real auth round-trip before entering the demo workspace.
    window.setTimeout(() => router.push("/dashboard"), 900);
  };

  return (
    <div className="space-y-5">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn("sso")}
        disabled={pending !== null}
      >
        {pending === "sso" ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <GoogleMark />
        )}
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          signIn("email");
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="maya@fernhaven.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
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
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending !== null}>
          {pending === "email" && (
            <Loader2 className="animate-spin" aria-hidden="true" />
          )}
          {pending === "email" ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Exploring the demo? Any email opens the Fernhaven Home workspace.
      </p>
    </div>
  );
}
