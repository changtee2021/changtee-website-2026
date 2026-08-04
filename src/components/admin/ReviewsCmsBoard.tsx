"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Star } from "lucide-react";
import {
  DEMO_REVIEWS,
  REVIEW_SOURCE_LABELS,
  emptyReview,
  type ReviewItem,
  type ReviewSource,
} from "@/lib/cms/reviews-demo";
import { cn } from "@/lib/utils";
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

type StatusFilter = ReviewItem["status"] | "all";

export function ReviewsCmsBoard() {
  const [items, setItems] = useState<ReviewItem[]>(DEMO_REVIEWS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<ReviewItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = {
      all: items.length,
      published: 0,
      pending: 0,
      draft: 0,
      hidden: 0,
      pinned: 0,
      avg: 0,
    };
    let sum = 0;
    for (const i of items) {
      c[i.status] += 1;
      if (i.pinned) c.pinned += 1;
      sum += i.rating;
    }
    c.avg = items.length ? Number((sum / items.length).toFixed(1)) : 0;
    return c;
  }, [items]);

  const filtered = useMemo(
    () =>
      items
        .filter((i) => (statusFilter === "all" ? true : i.status === statusFilter))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [items, statusFilter],
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function upsert(next: ReviewItem) {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === next.id);
      if (idx === -1) return [next, ...prev];
      const copy = [...prev];
      copy[idx] = next;
      return copy;
    });
    setEditing(null);
    setCreating(false);
    flash(creating ? "เพิ่มรีวิวแล้ว (demo)" : "บันทึกรีวิวแล้ว (demo)");
  }

  function approve(item: ReviewItem) {
    setItems((prev) =>
      prev.map((p) =>
        p.id === item.id ? { ...p, status: "published" as const } : p,
      ),
    );
    flash("อนุมัติเผยแพร่แล้ว (demo)");
  }

  function togglePin(item: ReviewItem) {
    setItems((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, pinned: !p.pinned } : p)),
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              รีวิวลูกค้า
            </h2>
            <p className="mt-1 text-sm text-muted">
              คัดรีวิวจริงจาก Google / LINE มาโชว์ — สร้างความเชื่อมั่นใกล้ปุ่มติดต่อ
              <span className="ml-1">
                <DemoBadge />
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(emptyReview());
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            <Plus className="size-4" />
            เพิ่มรีวิว
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="คะแนนเฉลี่ย" value={counts.avg} tone="green" />
          <StatPill label="เผยแพร่" value={counts.published} tone="green" />
          <StatPill label="รอตรวจ" value={counts.pending} tone="amber" />
          <StatPill label="ปักหมุด" value={counts.pinned} />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", `ทั้งหมด (${counts.all})`],
              ["pending", `รอตรวจ (${counts.pending})`],
              ["published", `เผยแพร่ (${counts.published})`],
              ["hidden", `ซ่อน (${counts.hidden})`],
            ] as const
          ).map(([key, label]) => (
            <FilterChip
              key={key}
              active={statusFilter === key}
              onClick={() => setStatusFilter(key)}
              label={label}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-paper px-4 py-12 text-center text-sm text-muted">
            ไม่มีรีวิวในตัวกรองนี้
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-4",
                            i < item.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-line",
                          )}
                        />
                      ))}
                    </div>
                    <h3 className="mt-2 font-medium text-navy">{item.displayName}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/85">
                      “{item.body}”
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="rounded bg-paper px-2 py-0.5 text-navy">
                    {REVIEW_SOURCE_LABELS[item.source]}
                  </span>
                  {item.productHint ? (
                    <span className="rounded bg-paper px-2 py-0.5">
                      {item.productHint}
                    </span>
                  ) : null}
                  {item.pinned ? (
                    <span className="rounded bg-brand-red/10 px-2 py-0.5 text-brand-red">
                      หน้าแรก
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <div className="flex gap-2">
                    {item.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => approve(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <Check className="size-3.5" />
                        อนุมัติ
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => togglePin(item)}
                      className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-navy hover:bg-paper"
                    >
                      {item.pinned ? "เลิกปักหมุด" : "ปักหมุด"}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-brand-red hover:underline"
                    onClick={() => {
                      setCreating(false);
                      setEditing(item);
                    }}
                  >
                    แก้ไข
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editing ? (
        <ReviewFormModal
          item={editing}
          isCreate={creating}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={upsert}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-navy px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function ReviewFormModal({
  item,
  isCreate,
  onClose,
  onSave,
}: {
  item: ReviewItem;
  isCreate: boolean;
  onClose: () => void;
  onSave: (item: ReviewItem) => void;
}) {
  const [form, setForm] = useState(item);

  function set<K extends keyof ReviewItem>(key: K, value: ReviewItem[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.displayName.trim() || !form.body.trim()) {
      alert("กรอกชื่อแสดงและข้อความรีวิวให้ครบ");
      return;
    }
    onSave({
      ...form,
      displayName: form.displayName.trim(),
      body: form.body.trim(),
      productHint: form.productHint.trim(),
      sourceUrl: form.sourceUrl.trim(),
      rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
    });
  }

  return (
    <CmsModal
      title={isCreate ? "เพิ่มรีวิว" : "แก้ไขรีวิว"}
      subtitle="ใช้รีวิวจริงเท่านั้น — แก้ตัวสะกดได้ แต่ไม่แต่งความหมาย"
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4 pb-2">
        <Field
          label="ชื่อแสดง *"
          value={form.displayName}
          onChange={(v) => set("displayName", v)}
          placeholder="คุณมิ้นท์ — คอนโด พระราม 9"
        />
        <label className="block text-xs text-muted">
          คะแนน (1–5)
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("rating", n)}
                  className="rounded-lg p-1 hover:bg-paper"
                  aria-label={`${n} ดาว`}
                >
                  <Star
                    className={cn(
                      "size-6",
                      n <= form.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-line",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </label>
        <TextArea
          label="ข้อความรีวิว *"
          value={form.body}
          onChange={(v) => set("body", v)}
          rows={4}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="ประเภทงาน (ออปชัน)"
            value={form.productHint}
            onChange={(v) => set("productHint", v)}
            placeholder="ผ้าม่าน / ม่านม้วน"
          />
          <SelectField
            label="แหล่งที่มา"
            value={form.source}
            onChange={(v) => set("source", v as ReviewSource)}
            options={(Object.keys(REVIEW_SOURCE_LABELS) as ReviewSource[]).map(
              (k) => ({ value: k, label: REVIEW_SOURCE_LABELS[k] }),
            )}
          />
          <SelectField
            label="สถานะ"
            value={form.status}
            onChange={(v) => set("status", v as ReviewItem["status"])}
            options={[
              { value: "pending", label: "รอตรวจ" },
              { value: "published", label: "เผยแพร่" },
              { value: "hidden", label: "ซ่อน" },
              { value: "draft", label: "ร่าง" },
            ]}
          />
          <Field
            label="ลำดับแสดง"
            type="number"
            value={form.sortOrder}
            onChange={(v) => set("sortOrder", Number(v) || 0)}
          />
          <Field
            label="ลิงก์ต้นทาง (ออปชัน)"
            value={form.sourceUrl}
            onChange={(v) => set("sourceUrl", v)}
            className="sm:col-span-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={(e) => set("pinned", e.target.checked)}
          />
          ปักหมุดแสดงหน้าแรก
        </label>
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2 text-sm text-navy hover:bg-paper"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            บันทึก
          </button>
        </div>
      </form>
    </CmsModal>
  );
}
