import { NextResponse, type NextRequest } from "next/server";
import {
  getSiteUrl,
  isAdminHostname,
  isMarketingPath,
  resolveAdminRedirectBase,
  stripAdminPrefix,
  toInternalAdminPath,
} from "@/lib/admin-host";
import { ADMIN_AUTH_ENFORCED, getAuthRedirectIfNeeded } from "@/lib/admin-auth-edge";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionValue,
} from "@/lib/admin-session";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname, search } = request.nextUrl;

  if (isAdminHostname(host)) {
    if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) {
      return NextResponse.next();
    }

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const url = request.nextUrl.clone();
      url.pathname = stripAdminPrefix(pathname);
      return NextResponse.redirect(url, 308);
    }

    if (isMarketingPath(pathname)) {
      return NextResponse.redirect(new URL(`${pathname}${search}`, getSiteUrl()), 308);
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = toInternalAdminPath(pathname);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-changtee-admin-host", "1");

    const sessionOk = isValidAdminSessionValue(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    );
    const authRedirect = getAuthRedirectIfNeeded(pathname, "", sessionOk);
    if (ADMIN_AUTH_ENFORCED && authRedirect) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = authRedirect;
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  const adminBase = resolveAdminRedirectBase(host);
  if (adminBase && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    const dest = new URL(`${stripAdminPrefix(pathname)}${search}`, adminBase);
    return NextResponse.redirect(dest, 308);
  }

  // Path-mode /admin on same host
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const sessionOk = isValidAdminSessionValue(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    );
    const authRedirect = getAuthRedirectIfNeeded(pathname, "/admin", sessionOk);
    if (ADMIN_AUTH_ENFORCED && authRedirect) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = authRedirect;
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
