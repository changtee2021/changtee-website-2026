"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogIn } from "lucide-react";
import { ADMIN_AUTH_ENFORCED, getBootstrapAdmin } from "@/lib/admin-auth";
import {
  adminHref,
  adminNavGroups,
  isAdminNavActive,
} from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  basePath: string;
  siteUrl: string;
  onNavigate?: () => void;
  headerAction?: React.ReactNode;
};

export function AdminSidebar({
  basePath,
  siteUrl,
  onNavigate,
  headerAction,
}: AdminSidebarProps) {
  const pathname = usePathname() || basePath || "/";
  const bootstrapAdmin = getBootstrapAdmin();

  return (
    <aside className="flex h-full w-full flex-col bg-navy-deep text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-red font-display text-sm font-bold">
          CT
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-semibold">
            ช่างตี๋ Admin
          </div>
          <div className="truncate text-xs text-white/55">ระบบหลังบ้านเว็บไซต์</div>
        </div>
        {headerAction}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {adminNavGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              {group.label}
            </div>
            <ul className="space-y-1">
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
                        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/35"
                        title="เร็วๆ นี้"
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
                          เร็วๆ นี้
                        </span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.path || "home"}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-brand-red text-white shadow-sm"
                          : "text-white/75 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 rounded-lg bg-white/5 px-3 py-2.5">
          <div className="truncate text-xs font-medium text-white/90">
            {bootstrapAdmin.fullName}
          </div>
          <div className="mt-0.5 text-[11px] text-white/45">
            รหัส {bootstrapAdmin.employeeCode} · แอดมิน
            {!ADMIN_AUTH_ENFORCED ? " · ยังไม่บังคับ login" : null}
          </div>
        </div>
        <Link
          href={adminHref(basePath, "/login")}
          onClick={onNavigate}
          className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogIn className="size-4 shrink-0" />
          <span className="truncate">หน้า Login (เตรียมระบบ)</span>
        </Link>
        <a
          href={siteUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="size-4 shrink-0" />
          <span className="truncate">เปิดเว็บหลัก</span>
        </a>
        <p className="mt-2 px-3 text-[11px] leading-relaxed text-white/35">
          Production: admin.changtee-curtain.com
        </p>
      </div>
    </aside>
  );
}
