"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  adminHref,
  adminNavGroups,
  isAdminNavActive,
} from "@/lib/admin-nav";
import { useAdminInboxBadges } from "@/components/admin/useAdminInboxBadges";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  basePath: string;
  onNavigate?: () => void;
  headerAction?: React.ReactNode;
  /** Desktop icon-rail mode */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function AdminSidebar({
  basePath,
  onNavigate,
  headerAction,
  collapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname() || basePath || "/";
  const badges = useAdminInboxBadges();

  return (
    <aside className="flex h-full w-full flex-col bg-navy-deep text-white">
      <div
        className={cn(
          "flex items-center border-b border-white/10 py-4",
          collapsed ? "flex-col gap-2 px-2" : "gap-3 px-4",
        )}
      >
        <Link
          href={adminHref(basePath, "")}
          onClick={onNavigate}
          className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-navy ring-1 ring-white/15"
          aria-label="ช่างตี๋ Admin หน้าแรก"
        >
          <Image
            src="/images/brand/logo-mark-nav.png"
            alt="ช่างตี๋"
            fill
            className="object-contain p-0.5"
            sizes="40px"
            priority
          />
        </Link>
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
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
                const badgeLabel =
                  badgeCount > 99 ? "99+" : String(badgeCount);

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
                      title={
                        badgeCount > 0
                          ? `${item.label} · ใหม่ ${badgeCount} รายการ`
                          : item.label
                      }
                      className={cn(
                        "relative flex min-h-11 items-center rounded-lg text-sm transition-colors sm:min-h-10",
                        collapsed
                          ? "justify-center px-2 py-2.5"
                          : "gap-3 px-3 py-2.5",
                        active
                          ? "bg-brand-red text-white shadow-sm"
                          : "text-white/75 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <span className="relative shrink-0">
                        <Icon className="size-4" />
                        {collapsed && badgeCount > 0 ? (
                          <span
                            className={cn(
                              "absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold",
                              active
                                ? "bg-white text-brand-red"
                                : "bg-brand-red text-white",
                            )}
                          >
                            {badgeCount > 9 ? "9+" : badgeCount}
                          </span>
                        ) : null}
                      </span>
                      {!collapsed ? (
                        <>
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          {badgeCount > 0 ? (
                            <span
                              className={cn(
                                "min-w-5 shrink-0 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none",
                                active
                                  ? "bg-white text-brand-red"
                                  : "bg-brand-red text-white",
                              )}
                            >
                              {badgeLabel}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
