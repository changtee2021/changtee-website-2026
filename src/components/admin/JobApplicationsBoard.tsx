"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, FileDown, RefreshCw, Search } from "lucide-react";
import { requestInboxBadgeRefresh } from "@/lib/admin-inbox";
import { DEMO_APPLICATIONS } from "@/lib/careers/applications-demo";
import {
  APPLICATION_STATUS_CHOICES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
  applicationStatusChoices,
  formatInterviewAt,
  type ApplicationStatus,
  type JobApplication,
} from "@/lib/careers/types";
import { CmsModal, DemoBadge, FilterChip, StatPill } from "@/components/admin/cms/CmsShared";
import {
  InterviewDialog,
  RejectDialog,
} from "@/components/admin/ApplicationFollowupDialogs";
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
  const [followup, setFollowup] = useState<{
    application: JobApplication;
    mode: "interview_scheduled" | "rejected";
  } | null>(null);

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

  function applyApplication(next: JobApplication) {
    setApplications((prev) => prev.map((a) => (a.id === next.id ? next : a)));
    setSelected((prev) => (prev && prev.id === next.id ? next : prev));
  }

  function onStatusSelect(application: JobApplication, next: ApplicationStatus) {
    if (next === application.status) return;
    if (next === "interview_scheduled" || next === "rejected") {
      setFollowup({ application, mode: next });
      return;
    }
    void saveApplication(application.id, { status: next });
  }

  async function saveApplication(
    id: string,
    payload: Record<string, unknown>,
  ) {
    setSavingId(id);
    setError(null);
    const current = applications.find((a) => a.id === id);
    if (current) {
      applyApplication({
        ...current,
        ...payload,
        updatedAt: new Date().toISOString(),
      } as JobApplication);
    }

    if (!usingDemo) {
      try {
        const res = await fetch(`/api/admin/careers/applications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = (await res.json()) as {
          application?: JobApplication;
          error?: string;
        };
        if (!res.ok) throw new Error(json.error || "อัปเดตไม่สำเร็จ");
        if (json.application) applyApplication(json.application);
      } catch (err) {
        setError(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
      }
    }
    setSavingId(null);
    setFollowup(null);
    requestInboxBadgeRefresh();
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
              รวมใบสมัครทั่วไปที่ยังไม่มีตำแหน่งตรงในขณะนั้น
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
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="ใหม่" value={counts.new} />
          <StatPill label="นัดสัมภาษณ์" value={counts.interview_scheduled} />
          <StatPill label="รับเข้าทำงาน" value={counts.hired} tone="green" />
          <StatPill label="ไม่ผ่าน" value={counts.rejected} tone="red" />
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
            {APPLICATION_STATUS_CHOICES.map((s) => (
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
                <th className="px-4 py-3 font-medium">ดู</th>
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
                        onChange={(e) =>
                          onStatusSelect(a, e.target.value as ApplicationStatus)
                        }
                        className={cn(
                          "rounded-lg border px-2 py-1.5 text-xs font-medium outline-none",
                          APPLICATION_STATUS_STYLES[a.status].select,
                        )}
                      >
                        {applicationStatusChoices(a.status).map((s) => (
                          <option key={s} value={s}>
                            {APPLICATION_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        aria-label={`ดูรายละเอียด ${a.fullName}`}
                        title="ดูรายละเอียดทั้งหมด"
                        onClick={() => setSelected(a)}
                        className="inline-flex size-11 items-center justify-center rounded-xl border border-line text-navy hover:bg-paper sm:size-9"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {error ? <p className="text-sm text-brand-red">{error}</p> : null}
      </section>

      {followup?.mode === "interview_scheduled" ? (
        <InterviewDialog
          application={followup.application}
          busy={savingId === followup.application.id}
          onClose={() => setFollowup(null)}
          onSubmit={(payload) =>
            void saveApplication(followup.application.id, payload)
          }
        />
      ) : null}
      {followup?.mode === "rejected" ? (
        <RejectDialog
          application={followup.application}
          busy={savingId === followup.application.id}
          onClose={() => setFollowup(null)}
          onSubmit={(payload) =>
            void saveApplication(followup.application.id, payload)
          }
        />
      ) : null}

      {selected ? (
        <CmsModal
          title={selected.fullName}
          subtitle={selected.jobTitle || "สมัครทั่วไป"}
          onClose={() => setSelected(null)}
          wide
        >
          <div className="space-y-5">
            <section className="space-y-2">
              <h4 className="font-display text-sm font-semibold text-navy">
                ตำแหน่งและสถานะ
              </h4>
              <dl className="space-y-2 text-sm">
                <DetailRow
                  label="ตำแหน่งที่สนใจ"
                  value={selected.jobTitle || "สมัครทั่วไป"}
                />
                <DetailRow
                  label="ส่งใบสมัครเมื่อ"
                  value={new Date(selected.createdAt).toLocaleString("th-TH")}
                />
                {selected.interviewAt ? (
                  <DetailRow
                    label="นัดสัมภาษณ์"
                    value={formatInterviewAt(selected.interviewAt)}
                  />
                ) : null}
                {selected.rejectReason ? (
                  <DetailRow
                    label="สาเหตุไม่ผ่าน"
                    value={selected.rejectReason}
                  />
                ) : null}
              </dl>
              <label className="mt-2 block text-sm font-medium text-navy">
                สถานะ
                <select
                  value={selected.status}
                  disabled={savingId === selected.id}
                  onChange={(e) =>
                    onStatusSelect(
                      selected,
                      e.target.value as ApplicationStatus,
                    )
                  }
                  className={cn(
                    "mt-1 block min-h-11 w-full rounded-xl border px-3 text-sm font-medium outline-none sm:min-h-9",
                    APPLICATION_STATUS_STYLES[selected.status].select,
                  )}
                >
                  {applicationStatusChoices(selected.status).map((s) => (
                    <option key={s} value={s}>
                      {APPLICATION_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="space-y-2">
              <h4 className="font-display text-sm font-semibold text-navy">
                ข้อมูลติดต่อ
              </h4>
              <dl className="space-y-2 text-sm">
                <DetailRow label="ชื่อ-นามสกุล" value={selected.fullName} />
                <DetailRow label="เบอร์โทร" value={selected.phone} />
                <DetailRow label="อีเมล" value={selected.email} />
                <DetailRow label="LINE ID" value={selected.lineId} />
                <DetailRow label="ที่อยู่ / จังหวัด" value={selected.address} />
              </dl>
            </section>

            <section className="space-y-2">
              <h4 className="font-display text-sm font-semibold text-navy">
                ประวัติและเงื่อนไข
              </h4>
              <dl className="space-y-2 text-sm">
                <DetailRow label="ระดับการศึกษา" value={selected.education} />
                <DetailRow
                  label="วันที่พร้อมเริ่มงาน"
                  value={selected.availableFrom}
                />
                <DetailRow
                  label="เงินเดือนที่คาดหวัง"
                  value={selected.expectedSalary}
                />
                <DetailRow
                  label="ประสบการณ์ทำงาน"
                  value={selected.experienceNote}
                />
                <DetailRow
                  label="ข้อความถึงเรา"
                  value={selected.coverNote}
                />
              </dl>
            </section>

            <section className="space-y-3">
              <h4 className="font-display text-sm font-semibold text-navy">
                ไฟล์แนบ / พอร์ต
              </h4>
              <AttachmentRow
                label="เรซูเม่"
                name={selected.resumeFileName}
                href={selected.resumeSignedUrl}
              />
              {(selected.portfolioFiles || []).length > 0 ? (
                selected.portfolioFiles!.map((file, index) => (
                  <AttachmentRow
                    key={`${file.name}-${index}`}
                    label={`พอร์ต ${index + 1}`}
                    name={file.name}
                    href={file.signedUrl}
                  />
                ))
              ) : (
                <p className="text-sm text-muted">ยังไม่มีไฟล์พอร์ต</p>
              )}
            </section>
          </div>
        </CmsModal>
      ) : null}
    </div>
  );
}

function AttachmentRow({
  label,
  name,
  href,
}: {
  label: string;
  name?: string | null;
  href?: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper/40 px-3 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="truncate text-sm text-navy">{name || "ไม่มีไฟล์"}</p>
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-sm font-medium text-navy hover:bg-paper sm:min-h-9"
        >
          <FileDown className="size-4" />
          เปิดดู
        </a>
      ) : name ? (
        <span className="text-xs text-muted">เปิดดูไม่ได้ในโหมดนี้</span>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-line/70 pb-2">
      <dt className="text-muted">{label}</dt>
      <dd className="col-span-2 whitespace-pre-wrap text-navy">
        {value?.trim() ? value : "-"}
      </dd>
    </div>
  );
}
