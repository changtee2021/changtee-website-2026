"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Eye,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  type ContentStatus,
} from "@/lib/cms/content-status";
import { emptyHeroSlide, type HeroSlide } from "@/lib/cms/hero-slides-demo";
import {
  removeHeroSlide,
  setHeroSlides,
  upsertHeroSlide,
  useHeroSlides,
} from "@/lib/cms/demo-store";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import {
  DemoBadge,
  StatPill,
  StatusBadge,
} from "@/components/admin/cms/CmsShared";
import { CmsImageUpload } from "@/components/admin/cms/CmsImageUpload";
import { CmsLinkPicker } from "@/components/admin/cms/CmsLinkPicker";
import { CmsSitePreview } from "@/components/admin/cms/CmsSitePreview";
import { HeroSlider } from "@/components/home/HeroSlider";
import { linkLabel } from "@/lib/cms/site-link-options";

export function HeroSlidesCmsBoard() {
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);
  const slides = useHeroSlides();
  const [toast, setToast] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const ordered = useMemo(
    () => [...slides].sort((a, b) => a.sortOrder - b.sortOrder),
    [slides],
  );

  const counts = useMemo(() => {
    const c = { all: slides.length, published: 0, draft: 0, hidden: 0 };
    for (const s of slides) c[s.status] += 1;
    return c;
  }, [slides]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }

  function patch(id: string, partial: Partial<HeroSlide>) {
    const current = slides.find((s) => s.id === id);
    if (!current) return;
    upsertHeroSlide({
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    });
  }

  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    const list = [...ordered];
    const fromIdx = list.findIndex((s) => s.id === fromId);
    const toIdx = list.findIndex((s) => s.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    setHeroSlides(
      list.map((s, i) => ({
        ...s,
        sortOrder: i + 1,
        updatedAt: new Date().toISOString(),
      })),
    );
    flash("เรียงลำดับแล้ว");
  }

  function addSlide() {
    const next = emptyHeroSlide();
    next.sortOrder = ordered.length + 1;
    next.status = "published";
    upsertHeroSlide(next);
    flash("เพิ่มสไลด์แล้ว — อัปโหลดรูปและตั้งลิงก์ได้เลย");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              สไลด์หน้าแรก
            </h2>
            <p className="mt-1 text-sm text-muted">
              ลากเรียงลำดับ · อัปโหลดรูป · เลือกลิงก์หน้าเว็บหรือใส่ URL เอง
              <span className="ml-1">
                <DemoBadge />
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm text-navy hover:bg-paper"
            >
              <Eye className="size-4" />
              พรีวิว
            </button>
            <button
              type="button"
              onClick={addSlide}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
            >
              <Plus className="size-4" />
              เพิ่มสไลด์
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="เผยแพร่" value={counts.published} tone="green" />
          <StatPill label="ร่าง" value={counts.draft} tone="amber" />
          <StatPill label="ซ่อน" value={counts.hidden} />
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-3 shadow-sm sm:p-4">
        <p className="mb-3 px-1 text-xs text-muted">
          กดค้างที่ไอคอน ⋮⋮ แล้วลากสลับตำแหน่ง — ลำดับบนสุด = สไลด์แรก
        </p>

        {ordered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-paper px-4 py-12 text-center text-sm text-muted">
            ยังไม่มีสไลด์ —{" "}
            <button
              type="button"
              onClick={addSlide}
              className="font-medium text-brand-red hover:underline"
            >
              เพิ่มสไลด์แรก
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {ordered.map((slide, index) => (
              <li
                key={slide.id}
                draggable
                onDragStart={() => setDragId(slide.id)}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverId(slide.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId) reorder(dragId, slide.id);
                  setDragId(null);
                  setOverId(null);
                }}
                className={cn(
                  "rounded-xl border bg-white transition",
                  overId === slide.id && dragId !== slide.id
                    ? "border-brand-red shadow-sm"
                    : "border-line",
                  dragId === slide.id && "opacity-60",
                )}
              >
                <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-2 sm:contents">
                    <button
                      type="button"
                      className="mt-8 cursor-grab touch-none rounded-lg p-1.5 text-muted hover:bg-paper hover:text-navy active:cursor-grabbing sm:mt-10"
                      aria-label="ลากเพื่อเรียงลำดับ"
                      title="ลากเพื่อเรียงลำดับ"
                    >
                      <GripVertical className="size-5" />
                    </button>
                    <div className="w-28 shrink-0 sm:w-36">
                      <div className="mb-1 text-[11px] font-medium text-muted">
                        #{index + 1}
                      </div>
                      <CmsImageUpload
                        value={slide.src}
                        folder="hero"
                        aspectClassName="aspect-[16/10]"
                        onChange={(url) => patch(slide.id, { src: url })}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={slide.status} />
                      <select
                        value={slide.status}
                        onChange={(e) =>
                          patch(slide.id, {
                            status: e.target.value as ContentStatus,
                          })
                        }
                        className="rounded-lg border border-line px-2 py-1 text-xs text-navy outline-none focus:border-navy/40"
                      >
                        {(
                          Object.keys(CONTENT_STATUS_LABELS) as ContentStatus[]
                        ).map((k) => (
                          <option key={k} value={k}>
                            {CONTENT_STATUS_LABELS[k]}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-muted">
                        → {linkLabel(slide.href)}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="block text-xs text-muted">
                        หัวข้อ (EN)
                        <input
                          value={slide.title}
                          onChange={(e) =>
                            patch(slide.id, { title: e.target.value })
                          }
                          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
                          placeholder="ROLLER BLIND"
                        />
                      </label>
                      <label className="block text-xs text-muted">
                        หัวข้อย่อย (TH)
                        <input
                          value={slide.subtitle}
                          onChange={(e) =>
                            patch(slide.id, { subtitle: e.target.value })
                          }
                          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
                          placeholder="ม่านม้วน"
                        />
                      </label>
                    </div>

                    <CmsLinkPicker
                      value={slide.href}
                      onChange={(href) => patch(slide.id, { href })}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <Link
                        href={adminHref(
                          basePath,
                          `/cms/hero-slides/${slide.id}`,
                        )}
                        className="text-xs font-medium text-brand-red hover:underline"
                      >
                        แก้ไขละเอียด / พรีวิวเดี่ยว
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-brand-red"
                        onClick={() => {
                          if (!confirm("ลบสไลด์นี้?")) return;
                          removeHeroSlide(slide.id);
                          flash("ลบแล้ว");
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CmsSitePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="สไลด์หน้าแรก"
      >
        <HeroSlider
          slides={ordered.filter((s) => s.status === "published")}
        />
      </CmsSitePreview>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-navy px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
