/** Edge-safe auth helpers (no next/headers) for middleware. */

/**
 * Admin login gate — disabled until auth is wired up for daily use.
 * Set ADMIN_AUTH_ENFORCED=true to require login again.
 */
export function isAdminAuthEnforced(): boolean {
  return process.env.ADMIN_AUTH_ENFORCED === "true";
}

/** @deprecated use isAdminAuthEnforced() — kept for older imports */
export const ADMIN_AUTH_ENFORCED = false;

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
