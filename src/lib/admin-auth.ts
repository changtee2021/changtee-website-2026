/**
 * Admin auth scaffold — prepared for tomorrow's real login wiring.
 *
 * When `ADMIN_AUTH_ENFORCED` is false (default):
 * - Admin pages stay open without login
 * - `/admin/login` is a preview UI only
 *
 * Tomorrow: set `ADMIN_AUTH_ENFORCED = true`, wire Supabase Auth
 * (employee_code + password), protect `/admin/*` in middleware.
 */

import {
  APP_ROLE_LABELS,
  BOOTSTRAP_ADMIN_CODE,
  DEMO_STAFF,
  findStaffByEmployeeCode,
  type AppRole,
  type StaffUser,
} from "@/lib/admin-users";

/** Flip to true when ready to require login on /admin */
export const ADMIN_AUTH_ENFORCED = false;

export type AdminSessionUser = {
  employeeCode: string;
  fullName: string;
  email: string;
  role: AppRole;
  roleLabel: string;
};

export type AdminLoginResult =
  | { ok: true; user: AdminSessionUser }
  | { ok: false; error: string };

export function toSessionUser(staff: StaffUser): AdminSessionUser {
  return {
    employeeCode: staff.employeeCode,
    fullName: staff.fullName,
    email: staff.email,
    role: staff.role,
    roleLabel: APP_ROLE_LABELS[staff.role],
  };
}

export function getBootstrapAdmin(): StaffUser {
  return (
    findStaffByEmployeeCode(BOOTSTRAP_ADMIN_CODE, DEMO_STAFF) ?? DEMO_STAFF[0]
  );
}

/**
 * Preview credential check against demo staff (local only).
 * Not used for route protection until ADMIN_AUTH_ENFORCED is true.
 */
export function previewLogin(
  employeeCode: string,
  password: string,
  users: StaffUser[] = DEMO_STAFF,
): AdminLoginResult {
  const staff = findStaffByEmployeeCode(employeeCode, users);
  if (!staff || !staff.active) {
    return { ok: false, error: "ไม่พบรหัสพนักงาน หรือบัญชีถูกปิดใช้งาน" };
  }
  if (!staff.tempPassword) {
    return {
      ok: false,
      error: "บัญชียังไม่มีรหัสผ่าน — ให้แอดมินตั้งรหัสผ่านเริ่มต้นก่อน",
    };
  }
  if (staff.tempPassword !== password) {
    return { ok: false, error: "รหัสผ่านไม่ถูกต้อง" };
  }
  return { ok: true, user: toSessionUser(staff) };
}

/**
 * Placeholder for tomorrow's session reader (cookie / Supabase).
 * Returns null while auth is not enforced — admin stays open.
 */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  if (!ADMIN_AUTH_ENFORCED) return null;
  // TODO(tomorrow):
  // 1) supabase.auth.getUser()
  // 2) load changtee_web.profiles.employee_code + user_roles.role
  // 3) return toSessionUser(...)
  return null;
}

/**
 * Call from middleware tomorrow when ADMIN_AUTH_ENFORCED is true.
 * Returns redirect path to login, or null if allowed.
 */
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

export function isAdminLoginPath(pathname: string, basePath: string): boolean {
  const loginPath = `${basePath}/login`.replace(/\/+/g, "/") || "/login";
  return pathname === loginPath || pathname.endsWith("/login");
}
