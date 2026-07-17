import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";
const TOKEN_COOKIE = "c360-token";
const ROLE_COOKIE = "c360-role";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export default async function GoogleCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;

  if (error || !code) redirect("/login?error=google_failed");

  try {
    const res = await fetch(`${API_BASE}/api/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });

    if (!res.ok) redirect("/login?error=google_failed");

    const data = (await res.json()) as { token: string; role: string };
    const store = await cookies();
    store.set(TOKEN_COOKIE, data.token, COOKIE_OPTS);
    store.set(ROLE_COOKIE, data.role === "admin" ? "admin" : "customer", COOKIE_OPTS);
  } catch {
    redirect("/login?error=google_failed");
  }

  redirect("/dashboard");
}
