/** Edge-safe auth helpers (no next/headers) for middleware. */

export const ADMIN_AUTH_ENFORCED = process.env.ADMIN_AUTH_ENFORCED !== "false";

export function isAdminLoginPath(pathname: string, basePath: string): boolean {
  const loginPath = `${basePath}/login`.replace(/\/+/g, "/") || "/login";
  return pathname === loginPath || pathname.endsWith("/login");
}

export function getAuthRedirectIfNeeded(
  pathname: string,
  basePath: string,
  hasSession: boolean,
): string | null {
  if (!ADMIN_AUTH_ENFORCED) return null;
  if (isAdminLoginPath(pathname, basePath)) return null;
  if (hasSession) return null;
  return `${basePath}/login`.replace(/\/+/g, "/") || "/login";
}
