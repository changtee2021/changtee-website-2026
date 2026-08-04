"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  LOG_TABS,
  logsForTab,
  type LogTab,
} from "@/lib/admin-settings";
import { adminHref } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

const LEVEL_STYLE = {
  info: "bg-sky-50 text-sky-800",
  success: "bg-emerald-50 text-emerald-800",
  warn: "bg-amber-50 text-amber-900",
  error: "bg-rose-50 text-rose-800",
} as const;

type SystemLogsBoardProps = {
  basePath: string;
};

export function SystemLogsBoard({ basePath }: SystemLogsBoardProps) {
  const [tab, setTab] = useState<LogTab>("activity");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = logsForTab(tab);
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      (r) =>
        r.actor.toLowerCase().includes(needle) ||
        r.action.toLowerCase().includes(needle) ||
        r.detail.toLowerCase().includes(needle),
    );
  }, [tab, q]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <Link
          href={adminHref(basePath, "/settings")}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-navy"
        >
          <ArrowLeft className="size-4" />
          ตั้งค่าระบบ
        </Link>
        <h2 className="mt-3 font-display text-xl font-semibold text-navy sm:text-2xl">
          Logs / ประวัติ
        </h2>
        <p className="mt-1 text-sm text-muted">
          Activity · Lead events · Outbound · System
          <span className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
            ข้อมูลตัวอย่าง (demo)
          </span>
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap rounded-xl border border-line bg-paper p-1">
            {LOG_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                  tab === t.key
                    ? "bg-navy text-white"
                    : "text-muted hover:text-navy",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาใน log…"
            className="w-full min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm text-navy sm:min-w-[160px]"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">เวลา</th>
                <th className="px-4 py-3 font-medium">ผู้เกี่ยวข้อง</th>
                <th className="px-4 py-3 font-medium">การกระทำ</th>
                <th className="px-4 py-3 font-medium">รายละเอียด</th>
                <th className="px-4 py-3 font-medium">ระดับ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    ไม่พบรายการ
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-navy">
                      <div>{new Date(row.at).toLocaleDateString("th-TH")}</div>
                      <div className="text-xs text-muted">
                        {new Date(row.at).toLocaleTimeString("th-TH")}
                      </div>
                    </td>
                    <td className="px-4 py-3">{row.actor}</td>
                    <td className="px-4 py-3 font-medium text-navy">{row.action}</td>
                    <td className="px-4 py-3 text-muted">{row.detail}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          LEVEL_STYLE[row.level],
                        )}
                      >
                        {row.level}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-4 py-3 text-xs text-muted">
          พรุ่งนี้: เชื่อม{" "}
          <code>audit_logs</code> · <code>lead_events</code> ·{" "}
          <code>outbound_jobs</code>
        </p>
      </section>
    </div>
  );
}
