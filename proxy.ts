import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same functionality).
// Guards every /admin/* route except the login page itself, redirecting
// unauthenticated requests to /admin/login.
//
// We read the cookie directly off the request (Proxy runs in the Edge runtime),
// rather than via next/headers, to keep this module edge-safe.

const SESSION_COOKIE = "admin_session";
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session !== "true") {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run the proxy only for admin routes (and their nested paths).
  matcher: ["/admin/:path*"],
};
