import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Link2,
  Plug,
  ScrollText,
  Shield,
  Users,
} from "lucide-react";

export type SettingsSectionStatus = "ready" | "demo" | "soon";

export type SettingsSection = {
  path: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: SettingsSectionStatus;
  adminOnly?: boolean;
};

/** Cards on /admin/settings hub */
export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    path: "/settings/company",
    title: "ข้อมูลบริษัท / ติดต่อ",
    description: "ที่อยู่ เบอร์ LINE อีเมล เวลาทำการ โลโก้แบรนด์",
    icon: Building2,
    status: "demo",
    adminOnly: true,
  },
  {
    path: "/settings/notifications",
    title: "การแจ้งเตือน",
    description: "อีเมล · LINE · webhook เมื่อมี lead ใหม่",
    icon: Bell,
    status: "soon",
    adminOnly: true,
  },
  {
    path: "/settings/leads",
    title: "ค่าเริ่มต้น Lead",
    description: "สถานะเริ่มต้น มอบหมายเซลล์อัตโนมัติ ฟิลด์บังคับ",
    icon: Users,
    status: "soon",
    adminOnly: true,
  },
  {
    path: "/settings/users",
    title: "ผู้ใช้ / บทบาท",
    description: "เพิ่มเซลล์ แอดมิน รหัสพนักงาน",
    icon: Users,
    status: "ready",
    adminOnly: true,
  },
  {
    path: "/settings/security",
    title: "ความปลอดภัย",
    description: "Login session นโยบายรหัสผ่าน",
    icon: Shield,
    status: "soon",
    adminOnly: true,
  },
  {
    path: "/settings/seo",
    title: "SEO / Redirect",
    description: "redirect จาก path เก่า · meta เริ่มต้น",
    icon: Link2,
    status: "soon",
    adminOnly: true,
  },
  {
    path: "/settings/integrations",
    title: "การเชื่อมต่อ",
    description: "GA4 · Pixel · สถานะ env (ไม่โชว์ secret)",
    icon: Plug,
    status: "soon",
    adminOnly: true,
  },
  {
    path: "/settings/logs",
    title: "Logs / ประวัติ",
    description: "Activity · Lead events · Outbound · System",
    icon: ScrollText,
    status: "demo",
    adminOnly: true,
  },
];

export type LogTab = "activity" | "leads" | "outbound" | "system";

export const LOG_TABS: { key: LogTab; label: string }[] = [
  { key: "activity", label: "Activity" },
  { key: "leads", label: "Lead events" },
  { key: "outbound", label: "Outbound" },
  { key: "system", label: "System" },
];

export type DemoLogRow = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
  level: "info" | "success" | "warn" | "error";
};

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

export const DEMO_ACTIVITY_LOGS: DemoLogRow[] = [
  {
    id: "act-1",
    at: hoursAgo(1),
    actor: "แอดมินช่างตี๋ (000000)",
    action: "อัปเดตสถานะ lead",
    detail: "demo-lead-01 → ติดต่อแล้ว",
    level: "info",
  },
  {
    id: "act-2",
    at: hoursAgo(3),
    actor: "แอดมินช่างตี๋ (000000)",
    action: "มอบหมายเซลล์",
    detail: "demo-lead-03 → เซลล์โส",
    level: "success",
  },
  {
    id: "act-3",
    at: hoursAgo(5),
    actor: "เชลล์ตุ่น (000102)",
    action: "ยกเลิกคำขอ",
    detail: "demo-lead-08 · ลูกค้าเลื่อนโปรเจกต์",
    level: "warn",
  },
  {
    id: "act-4",
    at: hoursAgo(8),
    actor: "แอดมินช่างตี๋ (000000)",
    action: "เพิ่มผู้ใช้",
    detail: "เซลล์ฝัน · รหัส 000105",
    level: "success",
  },
  {
    id: "act-5",
    at: hoursAgo(26),
    actor: "ระบบ",
    action: "ทดสอบ login preview",
    detail: "รหัส 000000 · ผ่าน (ยังไม่สร้าง session)",
    level: "info",
  },
];

export const DEMO_LEAD_EVENT_LOGS: DemoLogRow[] = [
  {
    id: "le-1",
    at: hoursAgo(2),
    actor: "เซลล์โส",
    action: "new → contacted",
    detail: "คุณสมชาย ใจดี · ผ้าม่าน",
    level: "info",
  },
  {
    id: "le-2",
    at: hoursAgo(6),
    actor: "เชลล์โจ้",
    action: "contacted → quoted",
    detail: "ส่งใบเสนอราคาแล้ว",
    level: "success",
  },
  {
    id: "le-3",
    at: hoursAgo(12),
    actor: "เชลล์ตุ่น",
    action: "quoted → won",
    detail: "ปิดการขายสำเร็จ",
    level: "success",
  },
  {
    id: "le-4",
    at: hoursAgo(30),
    actor: "เซลล์โส",
    action: "new → cancelled",
    detail: "เหตุผล: ลูกค้าเลื่อนโปรเจกต์",
    level: "warn",
  },
];

export const DEMO_OUTBOUND_LOGS: DemoLogRow[] = [
  {
    id: "ob-1",
    at: hoursAgo(1),
    actor: "email",
    action: "sent",
    detail: "แจ้ง lead ใหม่ → admin@changtee-curtain.com",
    level: "success",
  },
  {
    id: "ob-2",
    at: hoursAgo(1),
    actor: "line",
    action: "pending",
    detail: "รอส่ง LINE group · lead demo-lead-01",
    level: "info",
  },
  {
    id: "ob-3",
    at: hoursAgo(20),
    actor: "webhook",
    action: "failed",
    detail: "timeout รอ CRM · จะ retry อีกครั้ง",
    level: "error",
  },
  {
    id: "ob-4",
    at: hoursAgo(28),
    actor: "email",
    action: "sent",
    detail: "ตอบรับลูกค้าอัตโนมัติ",
    level: "success",
  },
];

export const DEMO_SYSTEM_LOGS: DemoLogRow[] = [
  {
    id: "sys-1",
    at: hoursAgo(0.5),
    actor: "health",
    action: "ok",
    detail: "GET /api/public/health · 200",
    level: "success",
  },
  {
    id: "sys-2",
    at: hoursAgo(4),
    actor: "api/leads",
    action: "warn",
    detail: "Admin leads API ว่าง — ใช้ DEMO_LEADS",
    level: "warn",
  },
  {
    id: "sys-3",
    at: hoursAgo(18),
    actor: "auth",
    action: "info",
    detail: "ADMIN_AUTH_ENFORCED=true · บังคับ login แล้ว",
    level: "info",
  },
  {
    id: "sys-4",
    at: hoursAgo(40),
    actor: "mailer",
    action: "error",
    detail: "SMTP ไม่ได้ตั้งค่าใน env (demo)",
    level: "error",
  },
];

export function logsForTab(tab: LogTab): DemoLogRow[] {
  switch (tab) {
    case "activity":
      return DEMO_ACTIVITY_LOGS;
    case "leads":
      return DEMO_LEAD_EVENT_LOGS;
    case "outbound":
      return DEMO_OUTBOUND_LOGS;
    case "system":
      return DEMO_SYSTEM_LOGS;
  }
}

export type CompanySettings = {
  companyName: string;
  tradeName: string;
  address: string;
  phone: string;
  lineId: string;
  email: string;
  hours: string;
  mapUrl: string;
  usp: string;
  warrantyYears: number;
};

export const DEMO_COMPANY_SETTINGS: CompanySettings = {
  companyName: "ช่างตี๋ ผ้าม่าน",
  tradeName: "Chang Tee Curtain",
  address:
    "310 ถนนไทยรามัญ แขวงสามวาตะวันตก เขตคลองสามวา กรุงเทพมหานคร 10510",
  phone: "02-000-0000",
  lineId: "@changtee",
  email: "hello@changtee-curtain.com",
  hours: "จ.–ส. 09:00–18:00",
  mapUrl: "https://maps.google.com",
  usp: "ถูก เร็ว ดี",
  warrantyYears: 1,
};
