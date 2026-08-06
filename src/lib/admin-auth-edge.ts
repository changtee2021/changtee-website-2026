/** Edge-safe auth helpers (no next/headers) for middleware. */

/**
 * Production / Vercel always enforce login.
 * Local can set ADMIN_AUTH_ENFORCED=false only for emergency open access.
 */
export function isAdminAuthEnforced(): boolean {
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL === "1") {
    return true;
  }
  if (process.env.NODE_ENV === "production") return true;
  return process.env.ADMIN_AUTH_ENFORCED !== "false";
}

/** @deprecated use isAdminAuthEnforced() — kept for older imports */
export const ADMIN_AUTH_ENFORCED = true;

export function isAdminLoginPath(pathname: string, basePath: string): boolean {
  const loginPath = `${basePath}/login`.replace(/\/+/g, "/") || "/login";
  return pathname === loginPath || pathname.endsWith("/login");
}

export function getAuthRedirectIfNeeded(
  pathname: string,
  basePath: string,
  hasSession: boolean,
): string | null {
  if (!isAdminAuthEnforced()) return null;
  if (isAdminLoginPath(pathname, basePath)) return null;
  if (hasSession) return null;
  return `${basePath}/login`.replace(/\/+/g, "/") || "/login";
}

/** Protect /api/admin/* except session login/logout. */
export function isAdminApiPath(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

export function isAdminSessionApiPath(pathname: string): boolean {
  return pathname === "/api/admin/session";
}
