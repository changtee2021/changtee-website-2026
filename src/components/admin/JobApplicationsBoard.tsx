"use client";

import { useEffect, useMemo, useState } from "react";
import { FileDown, RefreshCw, Search } from "lucide-react";
import { DEMO_APPLICATIONS } from "@/lib/careers/applications-demo";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
  type ApplicationStatus,
  type JobApplication,
} from "@/lib/careers/types";
import { CmsModal, DemoBadge, FilterChip, StatPill } from "@/components/admin/cms/CmsShared";
import { cn } from "@/lib/utils";

export function JobApplicationsBoard() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<JobApplication | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/careers/applications");
      const json = (await res.json()) as { applications?: JobApplication[]; error?: string };
      if (!res.ok) throw new Error(json.error || "โหลดไม่สำเร็จ");
      const rows = json.applications || [];
      if (rows.length === 0) {
        setApplications(DEMO_APPLICATIONS);
        setUsingDemo(true);
      } else {
        setApplications(rows);
        setUsingDemo(false);
      }
    } catch (err) {
      setApplications(DEMO_APPLICATIONS);
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
    const c: Record<ApplicationStatus | "all", number> = {
      all: applications.length,
      new: 0,
      reviewing: 0,
      interview_scheduled: 0,
      hired: 0,
      rejected: 0,
      talent_pool: 0,
    };
    for (const a of applications) c[a.status] += 1;
    return c;
  }, [applications]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!query) return true;
      return (
        a.fullName.toLowerCase().includes(query) ||
        a.phone.includes(query) ||
        (a.jobTitle ?? "").toLowerCase().includes(query)
      );
    });
  }, [applications, statusFilter, search]);

  async function updateStatus(id: string, status: ApplicationStatus) {
    setSavingId(id);
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    if (!usingDemo) {
      try {
        const res = await fetch(`/api/admin/careers/applications/${id}`, {
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
              ใบสมัครงาน
            </h2>
            <p className="mt-1 text-sm text-muted">
              ใบสมัครจากหน้า{" "}
              <a href="/careers" target="_blank" className="text-navy underline">
                /careers
              </a>{" "}
              รวมทั้งใบสมัครทั่วไป (Talent Pool) ที่ยังไม่มีตำแหน่งตรงในขณะนั้น
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
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="ใหม่" value={counts.new} />
          <StatPill label="พิจารณา" value={counts.reviewing} tone="amber" />
          <StatPill label="นัดสัมภาษณ์" value={counts.interview_scheduled} />
          <StatPill label="รับเข้าทำงาน" value={counts.hired} tone="green" />
          <StatPill label="Talent Pool" value={counts.talent_pool} />
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
            {APPLICATION_STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                label={`${APPLICATION_STATUS_LABELS[s]} (${counts[s]})`}
              />
            ))}
          </div>
          <label className="relative block w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ / เบอร์ / ตำแหน่ง"
              className="w-full rounded-xl border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-navy/40"
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">ผู้สมัคร</th>
                <th className="px-4 py-3 font-medium">ตำแหน่งที่สนใจ</th>
                <th className="px-4 py-3 font-medium">ติดต่อ</th>
                <th className="px-4 py-3 font-medium">เรซูเม่</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    ไม่พบรายการตามตัวกรอง
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-t border-line align-top">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(a)}
                        className="text-left font-medium text-navy hover:underline"
                      >
                        {a.fullName}
                      </button>
                      <div className="text-xs text-muted">
                        {new Date(a.createdAt).toLocaleDateString("th-TH")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {a.jobTitle || "สมัครทั่วไป"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      <div>{a.phone}</div>
                      {a.email ? <div>{a.email}</div> : null}
                    </td>
                    <td className="px-4 py-3">
                      {a.resumeSignedUrl ? (
                        <a
                          href={a.resumeSignedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-red hover:underline"
                        >
                          <FileDown className="size-3.5" />
                          ดาวน์โหลด
                        </a>
                      ) : (
                        <span className="text-xs text-muted">ไม่มีไฟล์</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        disabled={savingId === a.id}
                        onChange={(e) => void updateStatus(a.id, e.target.value as ApplicationStatus)}
                        className={cn(
                          "rounded-lg border px-2 py-1.5 text-xs font-medium outline-none",
                          APPLICATION_STATUS_STYLES[a.status].select,
                        )}
                      >
                        {APPLICATION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {APPLICATION_STATUS_LABELS[s]}
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

      {selected ? (
        <CmsModal
          title={selected.fullName}
          subtitle={selected.jobTitle || "สมัครทั่วไป (Talent Pool)"}
          onClose={() => setSelected(null)}
        >
          <dl className="space-y-2 text-sm">
            <DetailRow label="เบอร์โทร" value={selected.phone} />
            <DetailRow label="อีเมล" value={selected.email} />
            <DetailRow label="LINE ID" value={selected.lineId} />
            <DetailRow label="ที่อยู่/จังหวัด" value={selected.address} />
            <DetailRow label="ระดับการศึกษา" value={selected.education} />
            <DetailRow label="เงินเดือนที่คาดหวัง" value={selected.expectedSalary} />
            <DetailRow label="วันที่พร้อมเริ่มงาน" value={selected.availableFrom} />
            <DetailRow label="ประสบการณ์ทำงาน" value={selected.experienceNote} />
            <DetailRow label="ข้อความจากผู้สมัคร" value={selected.coverNote} />
          </dl>
          {selected.resumeSignedUrl ? (
            <a
              href={selected.resumeSignedUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
            >
              <FileDown className="size-4" />
              ดาวน์โหลดเรซูเม่
            </a>
          ) : null}
        </CmsModal>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-line/70 pb-2">
      <dt className="text-muted">{label}</dt>
      <dd className="col-span-2 text-navy">{value?.trim() ? value : "-"}</dd>
    </div>
  );
}
