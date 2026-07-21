"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { ROLE_COOKIE } from "@/lib/auth-constants";
import type { AppRole } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";
const TOKEN_COOKIE = "c360-token";
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN_SCORE = 0.5;

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  if (!RECAPTCHA_SECRET || !token) return true; // skip if not configured
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: RECAPTCHA_SECRET, response: token }),
  });
  const data = (await res.json()) as { success: boolean; score?: number };
  return data.success && (data.score ?? 1) >= RECAPTCHA_MIN_SCORE;
}

function safePath(next: string | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function signIn(
  email: string,
  password: string,
  role: AppRole = "customer",
  next?: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Invalid credentials");
  }

  const { token, user } = (await res.json()) as {
    token: string;
    user: { role?: string };
  };

  const resolvedRole: AppRole = user.role === "admin" ? "admin" : "customer";
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };

  const store = await cookies();
  store.set(TOKEN_COOKIE, token, cookieOpts);
  store.set(ROLE_COOKIE, resolvedRole, cookieOpts);

  const target = safePath(next);
  if (resolvedRole === "admin") redirect(target ?? "/admin");
  redirect(target && !target.startsWith("/admin") ? target : "/dashboard");
}

export async function loginAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  if (formData.get("_honey")) return "Invalid request";

  const recaptchaOk = await verifyRecaptcha(formData.get("recaptcha_token") as string | null);
  if (!recaptchaOk) return "Request blocked. Please try again.";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = ((formData.get("role") as string) ?? "customer") as AppRole;
  const next = (formData.get("next") as string) || undefined;

  try {
    await signIn(email, password, role, next);
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return e instanceof Error ? e.message : "Sign in failed";
  }
  return null;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errs = (data as { errors?: Record<string, string[]> }).errors;
    const first = errs ? Object.values(errs)[0]?.[0] : null;
    throw new Error(first ?? (data as { message?: string }).message ?? "Registration failed");
  }

  const { token, user } = (await res.json()) as {
    token: string;
    user: { role?: string };
  };

  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };

  const store = await cookies();
  store.set(TOKEN_COOKIE, token, cookieOpts);
  store.set(ROLE_COOKIE, "customer", cookieOpts);
  redirect("/dashboard");
}

export async function registerAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  if (formData.get("_honey")) return "Invalid request";

  const recaptchaOk = await verifyRecaptcha(formData.get("recaptcha_token") as string | null);
  if (!recaptchaOk) return "Request blocked. Please try again.";

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await register(name, email, password);
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return e instanceof Error ? e.message : "Registration failed";
  }
  return null;
}

export async function exchangeGoogleCode(code: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) throw new Error("Google auth failed");

  const { token, role } = (await res.json()) as { token: string; role: string };
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };

  const store = await cookies();
  store.set(TOKEN_COOKIE, token, cookieOpts);
  store.set(ROLE_COOKIE, (role === "admin" ? "admin" : "customer") as AppRole, cookieOpts);
}

export async function deleteWorkspace(): Promise<{ error: string } | never> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;

  if (!token) redirect("/login");

  const res = await fetch(`${API_BASE}/api/workspace`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      error: (data as { message?: string }).message ?? "Failed to delete workspace",
    };
  }

  store.delete(TOKEN_COOKIE);
  store.delete(ROLE_COOKIE);
  redirect("/login");
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;

  if (token) {
    await fetch(`${API_BASE}/api/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    }).catch(() => {});
  }

  store.delete(TOKEN_COOKIE);
  store.delete(ROLE_COOKIE);
  redirect("/login");
}
