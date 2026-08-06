import { NextResponse, type NextRequest } from "next/server";
import {
  getSiteUrl,
  isAdminHostname,
  isMarketingPath,
  resolveAdminRedirectBase,
  stripAdminPrefix,
  toInternalAdminPath,
} from "@/lib/admin-host";
import {
  getAuthRedirectIfNeeded,
  isAdminApiPath,
  isAdminAuthEnforced,
  isAdminSessionApiPath,
} from "@/lib/admin-auth-edge";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

function withAdminHeaders(
  request: NextRequest,
  pathname: string,
  init?: { rewritePath?: string; adminHost?: boolean },
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-changtee-pathname", pathname);
  if (init?.adminHost) requestHeaders.set("x-changtee-admin-host", "1");

  if (init?.rewritePath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = init.rewritePath;
    const res = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname, search } = request.nextUrl;
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const sessionOk = (await verifyAdminSessionToken(sessionToken)) !== null;
  const authOn = isAdminAuthEnforced();

  if (authOn && isAdminApiPath(pathname) && !isAdminSessionApiPath(pathname)) {
    if (!sessionOk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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
      return NextResponse.redirect(
        new URL(`${pathname}${search}`, getSiteUrl()),
        308,
      );
    }

    const authRedirect = getAuthRedirectIfNeeded(pathname, "", sessionOk);
    if (authRedirect) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = authRedirect;
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    return withAdminHeaders(request, pathname, {
      rewritePath: toInternalAdminPath(pathname),
      adminHost: true,
    });
  }

  const adminBase = resolveAdminRedirectBase(host);
  if (adminBase && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    const dest = new URL(`${stripAdminPrefix(pathname)}${search}`, adminBase);
    return NextResponse.redirect(dest, 308);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const authRedirect = getAuthRedirectIfNeeded(pathname, "/admin", sessionOk);
    if (authRedirect) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = authRedirect;
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
    return withAdminHeaders(request, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
