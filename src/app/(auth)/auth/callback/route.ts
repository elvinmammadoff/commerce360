import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.orbittify.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://orbittify.com";
const TOKEN_COOKIE = "c360-token";
const ROLE_COOKIE = "c360-role";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const failed = NextResponse.redirect(`${APP_URL}/login?error=google_failed`);

  if (error || !code) return failed;

  try {
    const res = await fetch(`${API_BASE}/api/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });

    if (!res.ok) return failed;

    const { token, role } = (await res.json()) as { token: string; role: string };

    const isAdmin = role === "admin";
    const response = NextResponse.redirect(`${APP_URL}${isAdmin ? "/admin" : "/dashboard"}`);
    response.cookies.set(TOKEN_COOKIE, token, COOKIE_OPTS);
    response.cookies.set(ROLE_COOKIE, isAdmin ? "admin" : "customer", COOKIE_OPTS);
    return response;
  } catch {
    return failed;
  }
}
