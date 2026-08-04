"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Eye,
  Pin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  slugifyTh,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  DEMO_PORTFOLIO,
  PRODUCT_OPTIONS,
  SPACE_TYPE_LABELS,
  emptyPortfolio,
  productLabel,
  type PortfolioItem,
  type SpaceType,
} from "@/lib/cms/portfolio-demo";
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

type StatusFilter = ContentStatus | "all";

export function PortfolioCmsBoard() {
  const [items, setItems] = useState<PortfolioItem[]>(DEMO_PORTFOLIO);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { all: items.length, published: 0, draft: 0, hidden: 0, pinned: 0 };
    for (const i of items) {
      c[i.status] += 1;
      if (i.pinned) c.pinned += 1;
    }
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items
      .filter((i) => (statusFilter === "all" ? true : i.status === statusFilter))
      .filter((i) => {
        if (!query) return true;
        return (
          i.title.toLowerCase().includes(query) ||
          i.place.toLowerCase().includes(query) ||
          i.tags.some((t) => t.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [items, statusFilter, q]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function upsert(next: PortfolioItem) {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === next.id);
      if (idx === -1) return [next, ...prev];
      const copy = [...prev];
      copy[idx] = next;
      return copy;
    });
    setEditing(null);
    setCreating(false);
    flash(creating ? "เพิ่มผลงานแล้ว (demo)" : "บันทึกผลงานแล้ว (demo)");
  }

  function remove(id: string) {
    if (!confirm("ซ่อนผลงานนี้จากรายการ? (demo — ลบออกจากรายการชั่วคราว)")) return;
    setItems((prev) => prev.filter((p) => p.id !== id));
    flash("ลบออกจากรายการแล้ว (demo)");
  }

  function togglePin(item: PortfolioItem) {
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
              ผลงาน
            </h2>
            <p className="mt-1 text-sm text-muted">
              อัปโหลดงานจริง ปักหมุดหน้าแรก — ลูกค้าเห็นภาพแล้วตัดสินใจง่ายขึ้น
              <span className="ml-1">
                <DemoBadge />
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(emptyPortfolio());
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            <Plus className="size-4" />
            เพิ่มผลงาน
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="เผยแพร่" value={counts.published} tone="green" />
          <StatPill label="ร่าง" value={counts.draft} tone="amber" />
          <StatPill label="ปักหมุดหน้าแรก" value={counts.pinned} />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                label={`${CONTENT_STATUS_LABELS[s]} (${counts[s]})`}
              />
            ))}
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาชื่อ / ที่ตั้ง / แท็ก"
              className="w-full rounded-xl border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-navy/40"
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-paper px-4 py-12 text-center text-sm text-muted">
            ไม่พบผลงานตามตัวกรอง — ลองเปลี่ยนสถานะหรือเพิ่มผลงานใหม่
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:border-navy/25"
              >
                <div className="relative aspect-[4/3] bg-paper">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                    <StatusBadge status={item.status} />
                    {item.pinned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-red px-2 py-0.5 text-[11px] font-medium text-white">
                        <Pin className="size-3" />
                        หน้าแรก
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-semibold text-navy">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted">{item.place}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-paper px-2 py-0.5 text-[11px] text-navy">
                      {productLabel(item.productSlug)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-ink/80">{item.summary}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded bg-paper px-1.5 py-0.5 text-[11px] text-muted"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
                    <button
                      type="button"
                      onClick={() => togglePin(item)}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        item.pinned ? "text-brand-red" : "text-muted hover:text-navy",
                      )}
                    >
                      <Pin className="size-3.5" />
                      {item.pinned ? "เลิกปักหมุด" : "ปักหมุด"}
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="text-xs text-muted hover:text-brand-red"
                        onClick={() => remove(item.id)}
                        aria-label="ลบ"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
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
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editing ? (
        <PortfolioFormModal
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

function PortfolioFormModal({
  item,
  isCreate,
  onClose,
  onSave,
}: {
  item: PortfolioItem;
  isCreate: boolean;
  onClose: () => void;
  onSave: (item: PortfolioItem) => void;
}) {
  const [form, setForm] = useState(item);
  const [tagText, setTagText] = useState(item.tags.join(", "));

  function set<K extends keyof PortfolioItem>(key: K, value: PortfolioItem[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.place.trim()) {
      alert("กรอกชื่อผลงานและที่ตั้งให้ครบ");
      return;
    }
    const slug = form.slug.trim() || slugifyTh(form.title);
    onSave({
      ...form,
      title: form.title.trim(),
      place: form.place.trim(),
      slug,
      summary: form.summary.trim(),
      detail: form.detail.trim(),
      tags: tagText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <CmsModal
      title={isCreate ? "เพิ่มผลงาน" : "แก้ไขผลงาน"}
      subtitle="ใส่รูปงานจริง + สรุปสั้นๆ พอ — ไม่ต้องเขียนยาว"
      onClose={onClose}
      wide
    >
      <form onSubmit={submit} className="space-y-4 pb-2">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="ชื่อผลงาน *"
            value={form.title}
            onChange={(v) => {
              set("title", v);
              if (isCreate || !form.slug) set("slug", slugifyTh(v));
            }}
            placeholder="เช่น ผ้าม่านลอนเทป ห้องนั่งเล่น"
            className="sm:col-span-2"
          />
          <Field
            label="Slug (URL)"
            value={form.slug}
            onChange={(v) => set("slug", v)}
            hint="ใช้ในลิงก์ /portfolio/..."
          />
          <Field
            label="ที่ตั้ง (ไม่ต้องระบุบ้านเลขที่)"
            value={form.place}
            onChange={(v) => set("place", v)}
            placeholder="พระราม 5 นนทบุรี"
          />
          <SelectField
            label="ประเภทสินค้า"
            value={form.productSlug}
            onChange={(v) => set("productSlug", v)}
            options={PRODUCT_OPTIONS}
          />
          <SelectField
            label="ประเภทสถานที่"
            value={form.spaceType}
            onChange={(v) => set("spaceType", v as SpaceType)}
            options={(Object.keys(SPACE_TYPE_LABELS) as SpaceType[]).map((k) => ({
              value: k,
              label: SPACE_TYPE_LABELS[k],
            }))}
          />
          <SelectField
            label="สถานะ"
            value={form.status}
            onChange={(v) => set("status", v as ContentStatus)}
            options={(Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]).map(
              (k) => ({ value: k, label: CONTENT_STATUS_LABELS[k] }),
            )}
          />
          <Field
            label="ลำดับแสดง"
            type="number"
            value={form.sortOrder}
            onChange={(v) => set("sortOrder", Number(v) || 0)}
          />
          <Field
            label="รูปหลัก (path หรือ URL)"
            value={form.image}
            onChange={(v) => set("image", v)}
            className="sm:col-span-2"
            hint="รอบถัดไปจะอัปโหลดไฟล์ได้ — ตอนนี้ใส่ path ใน public ได้"
          />
          <TextArea
            label="สรุปสั้น (การ์ด)"
            value={form.summary}
            onChange={(v) => set("summary", v)}
            rows={2}
            className="sm:col-span-2"
          />
          <TextArea
            label="รายละเอียดเพิ่ม"
            value={form.detail}
            onChange={(v) => set("detail", v)}
            rows={3}
            className="sm:col-span-2"
            hint="ผ้าอะไร / ชั้นผ้า / จุดเด่นหน้างาน"
          />
          <Field
            label="แท็ก (คั่นด้วยจุลภาค)"
            value={tagText}
            onChange={setTagText}
            placeholder="ม่านม้วน, sunscreen"
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

        {form.image ? (
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2 text-xs text-muted">
              <Eye className="size-3.5" />
              พรีวิวรูปหลัก
            </div>
            <div className="relative aspect-[16/9] bg-paper">
              <Image
                src={form.image}
                alt="preview"
                fill
                className="object-cover"
                sizes="600px"
              />
            </div>
          </div>
        ) : null}

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
            {isCreate ? "เพิ่มผลงาน" : "บันทึก"}
          </button>
        </div>
      </form>
    </CmsModal>
  );
}
