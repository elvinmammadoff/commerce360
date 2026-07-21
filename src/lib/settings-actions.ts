"use server";

import { cookies } from "next/headers";
import type { NotificationPreferences } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";
const TOKEN_COOKIE = "c360-token";

async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value;
}

export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): Promise<{ error: string } | null> {
  const token = await getToken();
  if (!token) return { error: "Unauthenticated" };

  const body = {
    ...(prefs.renderComplete !== undefined && { render_complete: prefs.renderComplete }),
    ...(prefs.renderFailed !== undefined && { render_failed: prefs.renderFailed }),
    ...(prefs.weeklyDigest !== undefined && { weekly_digest: prefs.weeklyDigest }),
    ...(prefs.productNews !== undefined && { product_news: prefs.productNews }),
  };

  const res = await fetch(`${API_BASE}/api/notification-preferences`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: (data as { message?: string }).message ?? "Failed to save preferences" };
  }

  return null;
}

export async function updateProfile(
  name: string,
): Promise<{ error: string } | null> {
  const token = await getToken();
  if (!token) return { error: "Unauthenticated" };

  const res = await fetch(`${API_BASE}/api/user`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: (data as { message?: string }).message ?? "Failed to save profile" };
  }

  return null;
}

export async function updateWorkspaceName(
  name: string,
): Promise<{ error: string } | null> {
  const token = await getToken();
  if (!token) return { error: "Unauthenticated" };

  const res = await fetch(`${API_BASE}/api/workspace`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: (data as { message?: string }).message ?? "Failed to update workspace" };
  }

  return null;
}
