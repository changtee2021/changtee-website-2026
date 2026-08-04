"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SETTINGS_SECTIONS } from "@/lib/admin-settings";
import { adminHref } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  ready: "พร้อมใช้",
  demo: "demo",
  soon: "เร็วๆ นี้",
};

type SettingsHubProps = {
  basePath: string;
};

export function SettingsHub({ basePath }: SettingsHubProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
          ตั้งค่าระบบ
        </h2>
        <p className="mt-1 text-sm text-muted">
          บริษัท · แจ้งเตือน · ความปลอดภัย · Logs — ส่วนใหญ่ admin เท่านั้น
          <span className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
            P0 hub + company + logs
          </span>
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.path}
              href={adminHref(basePath, section.path)}
              className={cn(
                "rounded-2xl border bg-white p-5 shadow-sm transition-colors hover:border-navy/30 hover:bg-paper",
                section.status === "soon" ? "border-dashed border-line" : "border-line",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-navy/10 text-navy">
                  <Icon className="size-5" />
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    section.status === "ready" &&
                      "bg-emerald-50 text-emerald-700",
                    section.status === "demo" && "bg-amber-50 text-amber-800",
                    section.status === "soon" && "bg-paper text-muted",
                  )}
                >
                  {STATUS_LABEL[section.status]}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-navy">
                {section.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{section.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-red">
                {section.status === "soon" ? "ดูโครง →" : "เปิด"}
                <ArrowRight className="size-3.5" />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
