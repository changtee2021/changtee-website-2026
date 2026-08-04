"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAdminLoginPath } from "@/lib/admin-auth";
import { resolveAdminPageTitle } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  basePath: string;
  siteUrl: string;
  children: React.ReactNode;
};

export function AdminShell({ basePath, siteUrl, children }: AdminShellProps) {
  const pathname = usePathname() || basePath || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = resolveAdminPageTitle(pathname, basePath);
  const isLogin = isAdminLoginPath(pathname, basePath);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#eef2f7] text-ink">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64">
        <AdminSidebar basePath={basePath} siteUrl={siteUrl} />
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
          onClick={() => setMobileOpen(false)}
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
            onNavigate={() => setMobileOpen(false)}
            headerAction={
              <button
                type="button"
                aria-label="ปิดเมนู"
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </button>
            }
          />
        </div>
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-white/95 px-3 backdrop-blur sm:gap-3 sm:px-6">
          <button
            type="button"
            className="rounded-lg border border-line p-2 text-navy lg:hidden"
            aria-label="เปิดเมนู"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </button>
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
