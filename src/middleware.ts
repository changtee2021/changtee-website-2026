import { NextResponse, type NextRequest } from "next/server";
import {
  getAdminUrl,
  getSiteUrl,
  isAdminHostname,
  isMarketingPath,
  isProductionMarketingHost,
  isProductionVercelHost,
  PRODUCTION_SITE_HOST,
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
import { legacyCmsRedirect } from "@/lib/legacy-cms-redirects";
import { localeFromPrefix } from "@/lib/i18n/locale";
import { localeToParam } from "@/lib/i18n/lang-param";

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

/** Block indexing on preview/staging hosts that canonicalize to production. */
function applyPublicHostRobots(
  res: NextResponse,
  host: string,
  pathname: string,
): NextResponse {
  if (
    !isProductionMarketingHost(host) &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/")
  ) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

async function withPreviewHeaders(
  request: NextRequest,
  previewOk: boolean,
): Promise<NextResponse> {
  const requestHeaders = new Headers(request.headers);
  if (previewOk) {
    requestHeaders.set("x-changtee-preview", "1");
  }

  const route = resolvePublicLocaleRoute(request);
  if (route.redirect) return NextResponse.redirect(route.redirect, 308);
  const res = route.rewrite
    ? NextResponse.rewrite(route.rewrite, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });
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
        "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.google.com https://www.google.co.th https://www.googleadservices.com https://googleads.g.doubleclick.net https://ad.doubleclick.net https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://challenges.cloudflare.com",
        "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://challenges.cloudflare.com",
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

  const legacyDest = legacyCmsRedirect(pathname);
  if (legacyDest && !pathname.startsWith("/api/") && !isAdminHostname(host)) {
    const url = request.nextUrl.clone();
    url.pathname = legacyDest;
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  // Old Vercel production URL (e.g. Google Ads final URL) → canonical domain
  if (
    isProductionVercelHost(host) &&
    !pathname.startsWith("/api/") &&
    !isAdminHostname(host)
  ) {
    const dest = new URL(`${pathname}${search}`, `https://${PRODUCTION_SITE_HOST}`);
    return NextResponse.redirect(dest, 308);
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const sessionOk = (await verifyAdminSessionToken(sessionToken)) !== null;
  const authOn = isAdminAuthEnforced();

  // Signed preview token on public site (editor iframe)
  const previewToken = request.nextUrl.searchParams.get(PREVIEW_QUERY);
  if (previewToken && !isAdminHostname(host) && !pathname.startsWith("/api/")) {
    const verified = await verifyPreviewToken(previewToken);
    const res = await withPreviewHeaders(request, verified !== null);
    return applyPublicHostRobots(res, host, pathname);
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
      const alias = publicAliasPath(pathname);
      return NextResponse.redirect(
        new URL(`${alias ?? pathname}${search}`, getSiteUrl()),
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

  const route = resolvePublicLocaleRoute(request);
  if (route.redirect) return NextResponse.redirect(route.redirect, 308);
  const res = route.rewrite
    ? NextResponse.rewrite(route.rewrite)
    : NextResponse.next();
  return applyPublicHostRobots(res, host, pathname);
}

/** Top-level app folders outside `app/[lang]` — never locale-rewritten. */
const NON_LOCALE_ROOTS = new Set(["api", "_next", "admin", "dev", "line-job"]);

/** Live duplicates of a canonical public page. Extra segments are dropped. */
const PUBLIC_ALIASES: Record<string, string> = {
  about: "contact",
  estimate: "quote",
};

/**
 * `/about` and `/{locale}/about` → contact (same for estimate → quote).
 * Thai stays unprefixed. One hop, including `/th/about` and mixed-case prefixes.
 */
function publicAliasPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return null;
  const first = segments[0];
  const thaiPrefix = first.toLowerCase() === "th";
  const locale = thaiPrefix ? null : localeFromPrefix(first);
  const hasLocale = thaiPrefix || locale !== null;
  const head = (hasLocale ? segments[1] : first)?.toLowerCase();
  const target = head ? PUBLIC_ALIASES[head] : undefined;
  if (!target) return null;
  const prefix = locale ? [localeToParam(locale)] : [];
  const dest = `/${[...prefix, target].join("/")}`;
  return dest === pathname ? null : dest;
}

/**
 * Thai URLs stay unprefixed (rewritten to `/th/...` internally); `/th/...`
 * redirects to the bare URL so each page has one Thai address. Other locales
 * keep their prefix, normalized to lowercase.
 */
function resolvePublicLocaleRoute(request: NextRequest): {
  redirect?: URL;
  rewrite?: URL;
} {
  const { pathname } = request.nextUrl;
  const alias = publicAliasPath(pathname);
  if (alias) {
    const dest = request.nextUrl.clone();
    dest.pathname = alias;
    return { redirect: dest };
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] ?? "";
  if (NON_LOCALE_ROOTS.has(first)) return {};

  if (first.toLowerCase() === "th") {
    const dest = request.nextUrl.clone();
    dest.pathname = `/${segments.slice(1).join("/")}`;
    return { redirect: dest };
  }

  const locale = localeFromPrefix(first);
  if (locale) {
    const canonicalSeg = localeToParam(locale);
    if (first === canonicalSeg) return {};
    const dest = request.nextUrl.clone();
    dest.pathname = `/${[canonicalSeg, ...segments.slice(1)].join("/")}`;
    return { redirect: dest };
  }

  const rewrite = request.nextUrl.clone();
  rewrite.pathname = pathname === "/" ? "/th" : `/th${pathname}`;
  return { rewrite };
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
