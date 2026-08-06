"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftOpen, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAdminLoginPath } from "@/lib/admin-auth-edge";
import { resolveAdminPageTitle } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "ctc-admin-sidebar-collapsed";
const SIDEBAR_COLLAPSE_EVENT = "ctc-admin-sidebar-collapsed-change";

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  window.addEventListener(SIDEBAR_COLLAPSE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(SIDEBAR_COLLAPSE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readSidebarCollapsed(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

type AdminShellProps = {
  basePath: string;
  siteUrl: string;
  sessionLabel?: { fullName: string; employeeCode: string; roleLabel: string };
  children: React.ReactNode;
};

export function AdminShell({
  basePath,
  siteUrl,
  sessionLabel,
  children,
}: AdminShellProps) {
  const pathname = usePathname() || basePath || "/";
  /** Open only while path matches — auto-closes on navigation */
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const mobileOpen = openForPath === pathname;
  const title = resolveAdminPageTitle(pathname, basePath);
  const isLogin = isAdminLoginPath(pathname, basePath);
  const desktopCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    readSidebarCollapsed,
    () => false,
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenForPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  function toggleDesktopSidebar() {
    const next = !readSidebarCollapsed();
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSE_EVENT));
  }

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#eef2f7] text-ink">
      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:transition-[width] lg:duration-200",
          desktopCollapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <AdminSidebar
          basePath={basePath}
          siteUrl={siteUrl}
          sessionLabel={sessionLabel}
          collapsed={desktopCollapsed}
          onToggleCollapse={toggleDesktopSidebar}
        />
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="ปิดเมนู"
          className={cn(
            "absolute inset-0 bg-navy-deep/50 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpenForPath(null)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] transform transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AdminSidebar
            basePath={basePath}
            siteUrl={siteUrl}
            sessionLabel={sessionLabel}
            onNavigate={() => setOpenForPath(null)}
            headerAction={
              <button
                type="button"
                aria-label="ปิดเมนู"
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setOpenForPath(null)}
              >
                <X className="size-5" />
              </button>
            }
          />
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-200",
          desktopCollapsed ? "lg:pl-16" : "lg:pl-64",
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-white/95 px-3 backdrop-blur sm:gap-3 sm:px-6">
          <button
            type="button"
            className="rounded-lg border border-line p-2 text-navy lg:hidden"
            aria-label="เปิดเมนู"
            onClick={() => setOpenForPath(pathname)}
          >
            <Menu className="size-5" />
          </button>
          {desktopCollapsed ? (
            <button
              type="button"
              className="hidden rounded-lg border border-line p-2 text-navy lg:inline-flex"
              aria-label="ขยายเมนูซ้าย"
              title="ขยายเมนูซ้าย"
              onClick={toggleDesktopSidebar}
            >
              <PanelLeftOpen className="size-5" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Backoffice
            </p>
            <h1 className="truncate font-display text-base font-semibold text-navy sm:text-lg">
              {title}
            </h1>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-paper px-2.5 py-1 text-xs text-muted">
              changtee_web
            </span>
            <span className="rounded-full bg-navy/10 px-2.5 py-1 text-xs font-medium text-navy">
              Admin
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-clip p-3 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
