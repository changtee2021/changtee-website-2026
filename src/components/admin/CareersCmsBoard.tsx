"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  EMPLOYMENT_TYPES,
  JOB_POSTING_STATUS_LABELS,
  emptyJobPosting,
  type JobPosting,
} from "@/lib/cms/careers-demo";
import {
  removeJobPosting,
  upsertJobPosting,
  useJobPostings,
} from "@/lib/cms/demo-store";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";
import {
  CmsModal,
  DemoBadge,
  Field,
  FilterChip,
  SelectField,
  StatPill,
  StatusBadge,
  TextArea,
} from "@/components/admin/cms/CmsShared";

type StatusFilter = ContentStatus | "all";

export function CareersCmsBoard() {
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);
  const postings = useJobPostings();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<JobPosting | null>(null);
  const [requirementsDraft, setRequirementsDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { all: postings.length, published: 0, draft: 0, hidden: 0 };
    for (const p of postings) c[p.status] += 1;
    return c;
  }, [postings]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return postings;
    return postings.filter((p) => p.status === statusFilter);
  }, [postings, statusFilter]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  function openNew() {
    const next = emptyJobPosting();
    setEditing(next);
    setRequirementsDraft("");
  }

  function openEdit(job: JobPosting) {
    setEditing(job);
    setRequirementsDraft(job.requirements.join("\n"));
  }

  function patch(partial: Partial<JobPosting>) {
    if (!editing) return;
    setEditing({ ...editing, ...partial, updatedAt: new Date().toISOString() });
  }

  function saveEditing() {
    if (!editing) return;
    if (!editing.title.trim()) {
      flash("กรุณากรอกชื่อตำแหน่งงาน");
      return;
    }
    const requirements = requirementsDraft
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const now = new Date().toISOString();
    upsertJobPosting({
      ...editing,
      requirements,
      publishedAt:
        editing.status === "published" ? editing.publishedAt || now : editing.publishedAt,
      updatedAt: now,
    });
    setEditing(null);
    flash("บันทึกตำแหน่งงานแล้ว");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              ประกาศรับสมัครงาน
            </h2>
            <p className="mt-1 text-sm text-muted">
              จัดการตำแหน่งงานที่แสดงบน{" "}
              <Link href="/careers" target="_blank" className="text-navy underline">
                /careers
              </Link>{" "}
              — ตั้งเป็น &quot;เปิดรับสมัคร&quot; เพื่อให้แสดงต่อผู้สมัครทันที
              <span className="ml-1">
                <DemoBadge />
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={adminHref(basePath, "/careers/applications")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-sm font-medium text-navy hover:bg-paper"
            >
              ดูใบสมัครงาน
            </Link>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
            >
              <Plus className="size-4" />
              เพิ่มตำแหน่งงาน
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="เปิดรับสมัคร" value={counts.published} tone="green" />
          <StatPill label="ร่าง" value={counts.draft} tone="amber" />
          <StatPill label="ปิดรับสมัคร" value={counts.hidden} />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            label={`ทั้งหมด (${counts.all})`}
          />
          {(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map((s) => (
            <FilterChip
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              label={JOB_POSTING_STATUS_LABELS[s]}
            />
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">ตำแหน่ง</th>
                <th className="px-4 py-3 font-medium">แผนก / ประเภทงาน</th>
                <th className="px-4 py-3 font-medium">รับ</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    ไม่พบตำแหน่งงานตามตัวกรอง —{" "}
                    <button
                      type="button"
                      onClick={openNew}
                      className="font-medium text-brand-red hover:underline"
                    >
                      เพิ่มตำแหน่งงาน
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr key={job.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openEdit(job)}
                        className="text-left hover:opacity-90"
                      >
                        <div className="font-medium text-navy">{job.title || "(ไม่มีชื่อ)"}</div>
                        <div className="text-xs text-muted line-clamp-1">{job.summary}</div>
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                      {job.department} · {job.employmentType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                      {job.headcount} คน
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(job)}
                          className="text-sm font-medium text-brand-red hover:underline"
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeJobPosting(job.id);
                            flash("ลบตำแหน่งงานแล้ว");
                          }}
                          className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-brand-red"
                          aria-label="ลบ"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing ? (
        <CmsModal
          title={editing.title ? `แก้ไข · ${editing.title}` : "ตำแหน่งงานใหม่"}
          onClose={() => setEditing(null)}
          wide
        >
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="ชื่อตำแหน่ง" value={editing.title} onChange={(v) => patch({ title: v })} />
              <Field
                label="แผนก"
                value={editing.department}
                onChange={(v) => patch({ department: v })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                label="ประเภทงาน"
                value={editing.employmentType}
                onChange={(v) => patch({ employmentType: v })}
                options={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: t }))}
              />
              <Field
                label="จำนวนที่รับ"
                type="number"
                value={editing.headcount}
                onChange={(v) => patch({ headcount: Math.max(1, Number(v) || 1) })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="สถานที่ทำงาน"
                value={editing.location}
                onChange={(v) => patch({ location: v })}
              />
              <Field
                label="เงินเดือน/ค่าตอบแทน"
                value={editing.salaryRange ?? ""}
                onChange={(v) => patch({ salaryRange: v })}
                placeholder="เช่น 15,000 - 20,000 บาท หรือ ตามตกลง"
              />
            </div>
            <Field
              label="สรุปตำแหน่งสั้นๆ (แสดงบนการ์ด)"
              value={editing.summary}
              onChange={(v) => patch({ summary: v })}
            />
            <TextArea
              label="หน้าที่ความรับผิดชอบ"
              value={editing.description}
              onChange={(v) => patch({ description: v })}
              rows={4}
              hint="แยกพารากราฟด้วยการเว้นบรรทัด"
            />
            <TextArea
              label="คุณสมบัติผู้สมัคร (1 บรรทัด = 1 ข้อ)"
              value={requirementsDraft}
              onChange={setRequirementsDraft}
              rows={4}
            />
            <SelectField
              label="สถานะ"
              value={editing.status}
              onChange={(v) => patch({ status: v as ContentStatus })}
              options={(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map((s) => ({
                value: s,
                label: JOB_POSTING_STATUS_LABELS[s],
              }))}
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-xl border border-line px-4 py-2 text-sm text-navy hover:bg-paper"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={saveEditing}
              className="rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
            >
              บันทึก
            </button>
          </div>
        </CmsModal>
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-navy px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
