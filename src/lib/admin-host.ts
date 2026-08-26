/** Admin host helpers — subdomain vs path-based `/admin`. */

export const PRODUCTION_SITE_HOST = "changtee-curtain.com";
export const PRODUCTION_ADMIN_HOST = "admin.changtee-curtain.com";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prodHost) {
    return `https://${prodHost.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }
  const previewHost = process.env.VERCEL_URL?.trim();
  if (previewHost) {
    return `https://${previewHost.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

/** Explicit admin origin; null = path mode (`/admin` on the same host). */
export function getAdminUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return null;
}

export function hostnameFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function normalizeHost(hostHeader: string): string {
  return hostHeader.split(":")[0]?.toLowerCase() || "";
}

/** Public marketing site on production apex (not www, not preview). */
export function isProductionMarketingHost(hostHeader: string): boolean {
  return normalizeHost(hostHeader) === PRODUCTION_SITE_HOST;
}

export function isAdminHostname(hostHeader: string): boolean {
  const host = normalizeHost(hostHeader);
  const configured = hostnameFromUrl(getAdminUrl());
  if (configured && host === configured) return true;
  return host === PRODUCTION_ADMIN_HOST || host === "admin.localhost";
}

/**
 * Redirect `/admin` to a separate host only when NEXT_PUBLIC_ADMIN_URL is set.
 * Production stays on `/admin` until that env is configured.
 */
export function resolveAdminRedirectBase(_hostHeader: string): string | null {
  return getAdminUrl();
}

export function stripAdminPrefix(pathname: string): string {
  if (pathname === "/admin") return "/";
  if (pathname.startsWith("/admin/")) {
    const rest = pathname.slice("/admin".length);
    return rest || "/";
  }
  return pathname;
}

export function toInternalAdminPath(pathname: string): string {
  if (pathname === "/" || pathname === "") return "/admin";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return pathname;
  return `/admin${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/**
 * Public marketing paths (redirected off admin subdomain).
 * Do NOT add `/editor` here — page editor lives under admin.
 */
const MARKETING_PREFIXES = [
  "/products",
  "/portfolio",
  "/blog",
  "/quote",
  "/learn",
  "/about",
  "/contact",
  "/privacy",
  "/cookies",
  "/terms",
  "/thank-you",
  "/unsubscribe",
  "/400",
  "/500",
  "/503",
  "/505",
] as const;

export function isMarketingPath(pathname: string): boolean {
  return MARKETING_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** Page editor routes (path mode `/admin/editor` or subdomain `/editor`) */
export function isEditorPath(pathname: string, basePath = "/admin"): boolean {
  if (pathname === "/editor" || pathname.startsWith("/editor/")) return true;
  const prefix = basePath ? `${basePath}/editor` : "/editor";
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
