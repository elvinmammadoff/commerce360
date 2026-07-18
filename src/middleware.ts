import { NextResponse, type NextRequest } from "next/server";

import { ROLE_COOKIE } from "@/lib/auth-constants";

const ADMIN_LOGIN_PATH = "/admin/login";
const TOKEN_COOKIE = "c360-token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes: role-based protection.
  if (pathname.startsWith("/admin")) {
    if (pathname === ADMIN_LOGIN_PATH) return NextResponse.next();
    const role = request.cookies.get(ROLE_COOKIE)?.value;
    if (role === "admin") return NextResponse.next();
    const url = request.nextUrl.clone();
    url.search = "";
    if (role) {
      url.pathname = "/dashboard";
    } else {
      url.pathname = ADMIN_LOGIN_PATH;
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url);
  }

  // Customer app routes: require a session token.
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/products/:path*",
    "/billing/:path*",
    "/credits/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/upload/:path*",
    "/api",
  ],
};
