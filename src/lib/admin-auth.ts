/**
 * Admin auth — HMAC-signed cookie session.
 * Production always requires login (see isAdminAuthEnforced).
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
  getAuthRedirectIfNeeded,
  isAdminAuthEnforced,
  isAdminLoginPath,
} from "@/lib/admin-auth-edge";
import {
  ADMIN_SESSION_COOKIE,
  resolveStaffFromEmployeeCode,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export {
  getAuthRedirectIfNeeded,
  getBootstrapAdmin,
  isAdminAuthEnforced,
  isAdminLoginPath,
};

/** Prefer isAdminAuthEnforced() — constant kept for UI that expects a boolean at build time. */
export const ADMIN_AUTH_ENFORCED = true;

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

function timingSafeStringEqual(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let out = a.length === b.length ? 0 : 1;
  for (let i = 0; i < max; i += 1) {
    out |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return out === 0;
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
      error:
        "บัญชียังไม่มีรหัสผ่าน — ตั้ง DEMO_ADMIN_PASSWORD บน Vercel (Production)",
    };
  }
  if (!timingSafeStringEqual(staff.tempPassword, password)) {
    return { ok: false, error: "รหัสผ่านไม่ถูกต้อง" };
  }
  return { ok: true, user: toSessionUser(staff) };
}

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const jar = await cookies();
  const verified = await verifyAdminSessionToken(
    jar.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!verified) return null;
  const staff =
    resolveStaffFromEmployeeCode(verified.employeeCode) ?? getBootstrapAdmin();
  return toSessionUser(staff);
}
