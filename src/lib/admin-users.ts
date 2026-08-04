export const APP_ROLES = ["admin", "editor", "sales"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  admin: "แอดมิน",
  editor: "แก้ไขคอนเทนต์",
  sales: "เซลล์",
};

export const APP_ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: "จัดการทุกอย่าง รวมผู้ใช้ บทบาท และรายงาน",
  editor: "จัดการคอนเทนต์เว็บ (ผลงาน บทความ รีวิว)",
  sales: "ดูแล lead / ใบเสนอราคาที่ได้รับมอบหมาย",
};

export type PermissionKey =
  | "view_analytics"
  | "manage_leads"
  | "assign_leads"
  | "manage_content"
  | "manage_users"
  | "manage_settings";

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  view_analytics: "ดูสถิติภาพรวม",
  manage_leads: "จัดการคำขอใบเสนอราคา",
  assign_leads: "มอบหมายเซลล์ผู้ดูแล",
  manage_content: "จัดการคอนเทนต์เว็บ",
  manage_users: "จัดการผู้ใช้ / บทบาท",
  manage_settings: "ตั้งค่าระบบ",
};

export const ROLE_PERMISSIONS: Record<AppRole, PermissionKey[]> = {
  admin: [
    "view_analytics",
    "manage_leads",
    "assign_leads",
    "manage_content",
    "manage_users",
    "manage_settings",
  ],
  editor: ["view_analytics", "manage_content"],
  sales: ["view_analytics", "manage_leads"],
};

export type StaffUser = {
  id: string;
  /** รหัสพนักงาน — used as login ID when auth is wired */
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  role: AppRole;
  active: boolean;
  note?: string;
  /**
   * Initial password set by admin when creating a user.
   * Demo / scaffold only — never persist plain text in production.
   * Tomorrow: hash + Supabase Auth invite / createUser.
   */
  tempPassword?: string | null;
};

/** Bootstrap admin — login ID = employee code 000000 */
export const BOOTSTRAP_ADMIN_CODE = "000000";
const bootstrapAdminPassword =
  process.env.DEMO_ADMIN_PASSWORD ||
  (process.env.NODE_ENV === "production" ? null : "changtee000000");

/** Demo staff — UI scaffold until Supabase Auth is wired. */
export const DEMO_STAFF: StaffUser[] = [
  {
    id: "staff-admin-01",
    employeeCode: BOOTSTRAP_ADMIN_CODE,
    fullName: "แอดมินช่างตี๋",
    email: "admin@changtee-curtain.com",
    phone: "02-000-0000",
    role: "admin",
    active: true,
    note: "ผู้ดูแลระบบหลัก — login ด้วยรหัสพนักงาน",
    tempPassword: bootstrapAdminPassword,
  },
  {
    id: "staff-editor-01",
    employeeCode: "000001",
    fullName: "ทีมคอนเทนต์",
    email: "content@changtee-curtain.com",
    phone: "02-000-0001",
    role: "editor",
    active: true,
  },
  {
    id: "staff-sales-01",
    employeeCode: "000101",
    fullName: "เชลล์โล",
    email: "sale.lo@changtee-curtain.com",
    phone: "092-887-4288",
    role: "sales",
    active: true,
  },
  {
    id: "staff-sales-02",
    employeeCode: "000102",
    fullName: "เชลล์ตุ่น",
    email: "sale.toon@changtee-curtain.com",
    phone: "094-216-3761",
    role: "sales",
    active: true,
  },
  {
    id: "staff-sales-03",
    employeeCode: "000103",
    fullName: "เชลล์โจ้",
    email: "sale.joe@changtee-curtain.com",
    phone: "094-216-3762",
    role: "sales",
    active: true,
  },
  {
    id: "staff-sales-04",
    employeeCode: "000104",
    fullName: "เชลล์เฟิร์น",
    email: "sale.fern@changtee-curtain.com",
    phone: "094-216-3763",
    role: "sales",
    active: true,
  },
  {
    id: "staff-sales-05",
    employeeCode: "000105",
    fullName: "เชลล์ฝัน",
    email: "sale.fun@changtee-curtain.com",
    phone: "081-550-8044",
    role: "sales",
    active: true,
  },
];

export function getSalesStaff(users: StaffUser[] = DEMO_STAFF) {
  return users.filter((u) => u.active && u.role === "sales");
}

export function findStaffById(id: string | null | undefined, users: StaffUser[] = DEMO_STAFF) {
  if (!id) return null;
  return users.find((u) => u.id === id) ?? null;
}

export function findStaffByEmployeeCode(
  code: string | null | undefined,
  users: StaffUser[] = DEMO_STAFF,
) {
  if (!code) return null;
  const normalized = code.trim();
  return users.find((u) => u.employeeCode === normalized) ?? null;
}

export function roleHasPermission(role: AppRole, permission: PermissionKey) {
  return ROLE_PERMISSIONS[role].includes(permission);
}
