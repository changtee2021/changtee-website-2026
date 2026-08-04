import { NextResponse, type NextRequest } from "next/server";
import {
  getSiteUrl,
  isAdminHostname,
  isMarketingPath,
  resolveAdminRedirectBase,
  stripAdminPrefix,
  toInternalAdminPath,
} from "@/lib/admin-host";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname, search } = request.nextUrl;

  // TODO(tomorrow): when ADMIN_AUTH_ENFORCED, require session for /admin/*
  // and redirect unauthenticated users to /login (see getAuthRedirectIfNeeded).

  if (isAdminHostname(host)) {
    if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) {
      return NextResponse.next();
    }

    // Canonical URLs on admin host: /admin → /
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const url = request.nextUrl.clone();
      url.pathname = stripAdminPrefix(pathname);
      return NextResponse.redirect(url, 308);
    }

    // Marketing pages belong on the public site
    if (isMarketingPath(pathname)) {
      return NextResponse.redirect(new URL(`${pathname}${search}`, getSiteUrl()), 308);
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = toInternalAdminPath(pathname);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-changtee-admin-host", "1");
    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  // Public host → push /admin* to admin subdomain when configured / production
  const adminBase = resolveAdminRedirectBase(host);
  if (adminBase && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    const dest = new URL(`${stripAdminPrefix(pathname)}${search}`, adminBase);
    return NextResponse.redirect(dest, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
