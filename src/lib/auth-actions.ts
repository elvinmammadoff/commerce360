"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ROLE_COOKIE } from "@/lib/auth-constants";
import type { AppRole } from "@/lib/types";

/** Only follow same-origin paths — never protocol-relative or absolute URLs. */
function safePath(next: string | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

/**
 * Demo sign-in: any credentials work, the chosen account type decides the
 * role. The role lives in an httpOnly cookie so the middleware and server
 * guards can enforce it on every request.
 */
export async function signInAs(role: AppRole, next?: string) {
  const store = await cookies();
  store.set(ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  const target = safePath(next);
  if (role === "admin") redirect(target ?? "/admin");
  // Customers never land on admin routes, even from a stale ?next=.
  redirect(target && !target.startsWith("/admin") ? target : "/dashboard");
}

export async function signOut() {
  const store = await cookies();
  store.delete(ROLE_COOKIE);
  redirect("/login");
}
