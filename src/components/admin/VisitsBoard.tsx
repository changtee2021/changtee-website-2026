"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { DEMO_VISITS } from "@/lib/visits/visits-demo";
import {
  VISIT_SESSION_SHORT_LABELS,
  VISIT_STATUSES,
  VISIT_STATUS_LABELS,
  VISIT_STATUS_STYLES,
  type FactoryVisitBooking,
  type VisitStatus,
} from "@/lib/visits/types";
import { DemoBadge, FilterChip, StatPill } from "@/components/admin/cms/CmsShared";
import { cn } from "@/lib/utils";

export function VisitsBoard() {
  const [visits, setVisits] = useState<FactoryVisitBooking[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/visits");
      const json = (await res.json()) as { visits?: FactoryVisitBooking[]; error?: string };
      if (!res.ok) throw new Error(json.error || "โหลดไม่สำเร็จ");
      const rows = json.visits || [];
      if (rows.length === 0) {
        setVisits(DEMO_VISITS);
        setUsingDemo(true);
      } else {
        setVisits(rows);
        setUsingDemo(false);
      }
    } catch (err) {
      setVisits(DEMO_VISITS);
      setUsingDemo(true);
      setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const counts = useMemo(() => {
    const c: Record<VisitStatus | "all", number> = {
      all: visits.length,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };
    for (const v of visits) c[v.status] += 1;
    return c;
  }, [visits]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return visits.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (!query) return true;
      return (
        v.fullName.toLowerCase().includes(query) ||
        v.phone.includes(query) ||
        (v.businessName ?? "").toLowerCase().includes(query)
      );
    });
  }, [visits, statusFilter, search]);

  async function updateStatus(id: string, status: VisitStatus) {
    setSavingId(id);
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    if (!usingDemo) {
      try {
        const res = await fetch(`/api/admin/visits/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error();
      } catch {
        setError("อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่");
      }
    }
    setSavingId(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              นัดเยี่ยมชมโรงงาน
            </h2>
            <p className="mt-1 text-sm text-muted">
              คำขอนัดจากฟอร์ม{" "}
              <a href="/visit-factory" target="_blank" className="text-navy underline">
                /visit-factory
              </a>{" "}
              — ยืนยัน/ปฏิเสธการนัดกับลูกค้าแล้วอัปเดตสถานะที่นี่
              {usingDemo ? (
                <span className="ml-1">
                  <DemoBadge />
                </span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm text-navy hover:bg-paper"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            รีเฟรช
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="รอยืนยัน" value={counts.pending} />
          <StatPill label="ยืนยันแล้ว" value={counts.confirmed} tone="green" />
          <StatPill label="ยกเลิก" value={counts.cancelled} tone="red" />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label={`ทั้งหมด (${counts.all})`}
            />
            {VISIT_STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                label={`${VISIT_STATUS_LABELS[s]} (${counts[s]})`}
              />
            ))}
          </div>
          <label className="relative block w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ / เบอร์ / บริษัท"
              className="w-full rounded-xl border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-navy/40"
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">วันที่ / รอบ</th>
                <th className="px-4 py-3 font-medium">ผู้ติดต่อ</th>
                <th className="px-4 py-3 font-medium">ติดต่อ</th>
                <th className="px-4 py-3 font-medium">จำนวน</th>
                <th className="px-4 py-3 font-medium">วัตถุประสงค์</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    ไม่พบรายการตามตัวกรอง
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-navy">{v.visitDate}</div>
                      <div className="text-xs text-muted">
                        {VISIT_SESSION_SHORT_LABELS[v.session]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-navy">{v.fullName}</div>
                      {v.businessName ? (
                        <div className="text-xs text-muted">{v.businessName}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      <div>{v.phone}</div>
                      {v.lineId ? <div>LINE: {v.lineId}</div> : null}
                      {v.email ? <div>{v.email}</div> : null}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{v.visitorCount} คน</td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {v.purpose || "-"}
                      {v.productInterest ? (
                        <div className="mt-0.5">สนใจ: {v.productInterest}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={v.status}
                        disabled={savingId === v.id}
                        onChange={(e) => void updateStatus(v.id, e.target.value as VisitStatus)}
                        className={cn(
                          "rounded-lg border px-2 py-1.5 text-xs font-medium outline-none",
                          VISIT_STATUS_STYLES[v.status].select,
                        )}
                      >
                        {VISIT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {VISIT_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {error ? <p className="text-sm text-brand-red">{error}</p> : null}
      </section>
    </div>
  );
}
