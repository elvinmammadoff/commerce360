/**
 * Demo session layer.
 *
 * Phase 1 stores the signed-in role in an httpOnly cookie set at login and
 * resolves the user from fixtures. Phase 2 swaps these bodies for Supabase
 * Auth — signatures stay unchanged, so layouts and guards never change.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ROLE_COOKIE } from "@/lib/auth-constants";
import { getAdminAccount, getCurrentUser } from "@/lib/data";
import type { AppRole, CurrentUser } from "@/lib/types";

/** Platform role for the current session. Unauthenticated reads as customer. */
export async function getSessionRole(): Promise<AppRole> {
  const store = await cookies();
  return store.get(ROLE_COOKIE)?.value === "admin" ? "admin" : "customer";
}

/** The signed-in account — staff persona for admins, workspace owner otherwise. */
export async function getSessionUser(): Promise<CurrentUser> {
  return (await getSessionRole()) === "admin"
    ? getAdminAccount()
    : getCurrentUser();
}

/**
 * Server-side guard for admin routes — the second line of defense behind the
 * middleware. Customers are bounced to their own dashboard, never a 404, so
 * deep links degrade gracefully.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  if ((await getSessionRole()) !== "admin") redirect("/dashboard");
  return getAdminAccount();
}
