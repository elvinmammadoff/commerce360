import { NextResponse, type NextRequest } from "next/server";

import { ROLE_COOKIE } from "@/lib/auth-constants";

/** Internal admin sign-in page — must stay reachable without an admin session. */
const ADMIN_LOGIN_PATH = "/admin/login";

/**
 * Role-based authorization for the admin console. Every /admin request is
 * checked at the edge before rendering: admins pass through, signed-in
 * customers are sent to their dashboard, and anonymous visitors go to the
 * internal admin sign-in with a return path. The (admin) layout re-checks via
 * requireAdmin() as defense in depth.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // The staff sign-in page is public so admins can authenticate.
  if (pathname === ADMIN_LOGIN_PATH) return NextResponse.next();

  const role = request.cookies.get(ROLE_COOKIE)?.value;
  if (role === "admin") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.search = "";
  if (role) {
    // Authenticated customer — admin routes are off limits.
    url.pathname = "/dashboard";
  } else {
    // No session — authenticate via the internal admin login, then come back.
    url.pathname = ADMIN_LOGIN_PATH;
    url.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/admin/:path*",
};
