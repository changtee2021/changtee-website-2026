/**
 * Admin auth — cookie session gate (employee_code + password via demo staff).
 * Set `ADMIN_AUTH_ENFORCED=false` only for emergency local open access.
 */

import { cookies } from "next/headers";
import {
  APP_ROLE_LABELS,
  DEMO_STAFF,
  findStaffByEmployeeCode,
  getBootstrapAdmin,
  type AppRole,
  type StaffUser,
} from "@/lib/admin-users";
import {
  ADMIN_AUTH_ENFORCED,
  getAuthRedirectIfNeeded,
  isAdminLoginPath,
} from "@/lib/admin-auth-edge";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_USER_COOKIE,
  isValidAdminSessionValue,
  resolveStaffFromEmployeeCode,
} from "@/lib/admin-session";

export {
  ADMIN_AUTH_ENFORCED,
  getAuthRedirectIfNeeded,
  getBootstrapAdmin,
  isAdminLoginPath,
};

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

/** Read admin session from httpOnly cookies (server components / route handlers). */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const jar = await cookies();
  if (!isValidAdminSessionValue(jar.get(ADMIN_SESSION_COOKIE)?.value)) {
    return null;
  }
  const staff =
    resolveStaffFromEmployeeCode(jar.get(ADMIN_SESSION_USER_COOKIE)?.value) ??
    getBootstrapAdmin();
  return toSessionUser(staff);
}
