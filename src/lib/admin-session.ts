import { DEMO_STAFF, findStaffByEmployeeCode, type StaffUser } from "@/lib/admin-users";

export const ADMIN_SESSION_COOKIE = "changtee_admin";
export const ADMIN_SESSION_USER_COOKIE = "changtee_admin_uid";
export const DEMO_SESSION_VALUE = "1";

export function getAdminSessionSecret(): string | null {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    (process.env.NODE_ENV === "production" ? null : DEMO_SESSION_VALUE)
  );
}

export function isValidAdminSessionValue(session: string | undefined | null): boolean {
  if (!session) return false;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && session === secret) return true;
  if (process.env.NODE_ENV !== "production" && session === DEMO_SESSION_VALUE) {
    return true;
  }
  return false;
}

export function resolveStaffFromEmployeeCode(
  employeeCode: string | undefined | null,
  users: StaffUser[] = DEMO_STAFF,
): StaffUser | null {
  if (!employeeCode) return null;
  const staff = findStaffByEmployeeCode(employeeCode, users);
  if (!staff || !staff.active) return null;
  return staff;
}
