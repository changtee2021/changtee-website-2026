"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { isAdminAuthEnforced } from "@/lib/admin-auth-edge";
import { getBootstrapAdmin } from "@/lib/admin-users";
import {
  adminHref,
  adminNavGroups,
  isAdminNavActive,
} from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  basePath: string;
  siteUrl: string;
  sessionLabel?: { fullName: string; employeeCode: string; roleLabel: string };
  onNavigate?: () => void;
  headerAction?: React.ReactNode;
  /** Desktop icon-rail mode */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function AdminSidebar({
  basePath,
  siteUrl,
  sessionLabel,
  onNavigate,
  headerAction,
  collapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname() || basePath || "/";
  const bootstrapAdmin = getBootstrapAdmin();
  const user = sessionLabel ?? {
    fullName: bootstrapAdmin.fullName,
    employeeCode: bootstrapAdmin.employeeCode,
    roleLabel: "แอดมิน",
  };

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    onNavigate?.();
    router.replace(adminHref(basePath, "/login"));
    router.refresh();
  }

  return (
    <aside className="flex h-full w-full flex-col bg-navy-deep text-white">
      <div
        className={cn(
          "flex items-center border-b border-white/10 py-4",
          collapsed ? "flex-col gap-2 px-2" : "gap-3 px-4",
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-red font-display text-sm font-bold">
          CT
        </div>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-sm font-semibold">
              ช่างตี๋ Admin
            </div>
            <div className="truncate text-xs text-white/55">
              ระบบหลังบ้านเว็บไซต์
            </div>
          </div>
        ) : null}
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label={collapsed ? "ขยายเมนู" : "หุบเมนู"}
            title={collapsed ? "ขยายเมนู" : "หุบเมนู"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>
        ) : null}
        {headerAction}
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto py-4",
          collapsed ? "space-y-2 px-2" : "space-y-5 px-3",
        )}
      >
        {adminNavGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {group.label}
              </div>
            ) : (
              <div className="mb-1 border-t border-white/10 first:border-0 first:pt-0" />
            )}
            <ul className={cn("space-y-1", collapsed && "space-y-1.5")}>
              {group.items.map((item) => {
                const href = adminHref(basePath, item.path);
                const active =
                  !item.soon &&
                  isAdminNavActive(pathname, basePath, item.path, item.exact);
                const Icon = item.icon;

                if (item.soon) {
                  return (
                    <li key={item.path || "home"}>
                      <div
                        className={cn(
                          "flex cursor-not-allowed items-center rounded-lg text-sm text-white/35",
                          collapsed
                            ? "justify-center px-2 py-2.5"
                            : "gap-3 px-3 py-2.5",
                        )}
                        title={`${item.label} (เร็วๆ นี้)`}
                      >
                        <Icon className="size-4 shrink-0" />
                        {!collapsed ? (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                              เร็วๆ นี้
                            </span>
                          </>
                        ) : null}
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.path || "home"}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      title={item.label}
                      className={cn(
                        "flex items-center rounded-lg text-sm transition-colors",
                        collapsed
                          ? "justify-center px-2 py-2.5"
                          : "gap-3 px-3 py-2.5",
                        active
                          ? "bg-brand-red text-white shadow-sm"
                          : "text-white/75 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!collapsed ? (
                        <span className="truncate">{item.label}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-white/10", collapsed ? "p-2" : "p-3")}>
        {!collapsed ? (
          <div className="mb-2 rounded-lg bg-white/5 px-3 py-2.5">
            <div className="truncate text-xs font-medium text-white/90">
              {user.fullName}
            </div>
            <div className="mt-0.5 text-[11px] text-white/45">
              รหัส {user.employeeCode} · {user.roleLabel}
              {!isAdminAuthEnforced() ? " · auth ปิดอยู่" : null}
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => void logout()}
          title="ออกจากระบบ"
          className={cn(
            "mb-1 flex w-full items-center rounded-lg text-sm text-white/65 transition-colors hover:bg-white/10 hover:text-white",
            collapsed ? "justify-center px-2 py-2.5" : "gap-2 px-3 py-2.5",
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed ? <span className="truncate">ออกจากระบบ</span> : null}
        </button>
        <a
          href={siteUrl}
          target="_blank"
          rel="noreferrer"
          title="เปิดเว็บหลัก"
          className={cn(
            "flex items-center rounded-lg text-sm text-white/65 transition-colors hover:bg-white/10 hover:text-white",
            collapsed ? "justify-center px-2 py-2.5" : "gap-2 px-3 py-2.5",
          )}
        >
          <ExternalLink className="size-4 shrink-0" />
          {!collapsed ? <span className="truncate">เปิดเว็บหลัก</span> : null}
        </a>
        {!collapsed ? (
          <p className="mt-2 px-3 text-[11px] leading-relaxed text-white/35">
            Production: admin.changtee-curtain.com
          </p>
        ) : null}
      </div>
    </aside>
  );
}
