import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  FileText,
  Images,
  LayoutDashboard,
  MessageSquareQuote,
  PanelsTopLeft,
  PencilRuler,
  ScrollText,
  Settings2,
  BookOpen,
  Users,
} from "lucide-react";
import { isPageEditorEnabled } from "@/lib/editor/page-registry";

export type AdminNavItem = {
  /** Path under admin base, e.g. "" or "/leads" */
  path: string;
  label: string;
  icon: LucideIcon;
  soon?: boolean;
  /** Match pathname exactly (don’t highlight parent when on child routes) */
  exact?: boolean;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "หลัก",
    items: [
      { path: "", label: "ภาพรวม", icon: LayoutDashboard },
      { path: "/leads", label: "คำขอใบเสนอราคา", icon: ClipboardList },
    ],
  },
  {
    label: "เนื้อหา",
    items: [
      ...(isPageEditorEnabled()
        ? [
            {
              path: "/editor/home",
              label: "Page Editor",
              icon: PencilRuler,
            } satisfies AdminNavItem,
          ]
        : []),
      { path: "/cms/hero-slides", label: "สไลด์หน้าแรก", icon: PanelsTopLeft },
      { path: "/cms/portfolio", label: "ผลงาน", icon: Images },
      { path: "/cms/blog", label: "บทความ", icon: FileText },
      { path: "/cms/catalogs", label: "แคตตาล็อก", icon: BookOpen },
      { path: "/cms/reviews", label: "รีวิว", icon: MessageSquareQuote },
    ],
  },
  {
    label: "ตั้งค่า",
    items: [
      { path: "/settings", label: "ตั้งค่าระบบ", icon: Settings2, exact: true },
      { path: "/settings/logs", label: "Logs / ประวัติ", icon: ScrollText },
      { path: "/settings/users", label: "ผู้ใช้ / บทบาท", icon: Users },
    ],
  },
];

export function adminHref(basePath: string, path: string): string {
  if (!path || path === "/") return basePath || "/";
  return `${basePath}${path}`;
}

/** Derive admin base from pathname (`/admin` or `` for subdomain). */
export function adminBaseFromPathname(pathname: string): string {
  return pathname === "/admin" || pathname.startsWith("/admin/") ? "/admin" : "";
}

export function resolveAdminPageTitle(pathname: string, basePath: string): string {
  const relative =
    basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
      ? pathname.slice(basePath.length) || ""
      : pathname === "/"
        ? ""
        : pathname;

  const normalized = relative.startsWith("/") ? relative : relative ? `/${relative}` : "";

  let best: { label: string; len: number } | null = null;
  for (const group of adminNavGroups) {
    for (const item of group.items) {
      const itemPath = item.path || "";
      const match =
        (!itemPath && normalized === "") ||
        (itemPath &&
          (normalized === itemPath || normalized.startsWith(`${itemPath}/`)));
      if (match) {
        const len = itemPath.length;
        if (!best || len > best.len) best = { label: item.label, len };
      }
    }
  }
  if (normalized === "/login") return "เข้าสู่ระบบ";
  return best?.label ?? "Admin";
}

export function isAdminNavActive(
  pathname: string,
  basePath: string,
  path: string,
  exact = false,
): boolean {
  const href = adminHref(basePath, path);
  if (!path || path === "/") {
    return (
      pathname === href ||
      pathname === "/admin" ||
      (basePath === "" && pathname === "/")
    );
  }
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
