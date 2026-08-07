import { NextResponse, type NextRequest } from "next/server";
import {
  getAdminUrl,
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
import { PREVIEW_QUERY } from "@/lib/editor/protocol";
import { verifyPreviewToken } from "@/lib/editor/preview-token";

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

function previewFrameAncestors(): string {
  const origins = new Set<string>(["'self'"]);
  const admin = getAdminUrl();
  if (admin) {
    try {
      origins.add(new URL(admin).origin);
    } catch {
      /* ignore */
    }
  }
  const site = getSiteUrl();
  if (site) {
    try {
      origins.add(new URL(site).origin);
    } catch {
      /* ignore */
    }
  }
  origins.add("https://admin.changtee-curtain.com");
  origins.add("https://changtee-website-2026.vercel.app");
  origins.add("http://admin.localhost:3000");
  origins.add("http://localhost:3000");
  return [...origins].join(" ");
}

async function withPreviewHeaders(
  request: NextRequest,
  previewOk: boolean,
): Promise<NextResponse> {
  const requestHeaders = new Headers(request.headers);
  if (previewOk) {
    requestHeaders.set("x-changtee-preview", "1");
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (previewOk) {
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Referrer-Policy", "no-referrer");
    // Overrides next.config CSP so admin origin can embed the draft preview
    res.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://challenges.cloudflare.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://challenges.cloudflare.com",
        "frame-src 'self' https://www.google.com https://maps.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        `frame-ancestors ${previewFrameAncestors()}`,
      ].join("; "),
    );
  }
  return res;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname, search } = request.nextUrl;
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const sessionOk = (await verifyAdminSessionToken(sessionToken)) !== null;
  const authOn = isAdminAuthEnforced();

  // Signed preview token on public site (editor iframe)
  const previewToken = request.nextUrl.searchParams.get(PREVIEW_QUERY);
  if (previewToken && !isAdminHostname(host) && !pathname.startsWith("/api/")) {
    const verified = await verifyPreviewToken(previewToken);
    return withPreviewHeaders(request, verified !== null);
  }

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
