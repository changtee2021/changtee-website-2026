"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Eye,
  LayoutGrid,
  LayoutList,
  MousePointerClick,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  type ContentStatus,
} from "@/lib/cms/content-status";
import {
  productLabel,
  type PortfolioItem,
} from "@/lib/cms/portfolio-demo";
import {
  removePortfolioItem,
  upsertPortfolioItem,
  usePortfolioItems,
} from "@/lib/cms/demo-store";
import { relatedPortfolio } from "@/lib/cms/public-content";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import {
  DemoBadge,
  FilterChip,
  StatPill,
  StatusBadge,
} from "@/components/admin/cms/CmsShared";
import { PortfolioAnalyticsPanel } from "@/components/admin/PortfolioAnalyticsPanel";
import { usePortfolioAnalytics } from "@/lib/cms/portfolio-analytics";
import { CmsSitePreview } from "@/components/admin/cms/CmsSitePreview";
import { PortfolioDetailView } from "@/components/portfolio/PortfolioDetailView";

type StatusFilter = ContentStatus | "all";
type LayoutMode = "grid3" | "grid6" | "list";

const LAYOUT_KEY = "changtee.cms.portfolio.layout";

export function PortfolioCmsBoard() {
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);
  const items = usePortfolioItems();
  const analytics = usePortfolioAnalytics();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutMode>(() => {
    if (typeof window === "undefined") return "grid3";
    try {
      const saved = window.localStorage.getItem(LAYOUT_KEY) as LayoutMode | null;
      if (saved === "grid3" || saved === "grid6" || saved === "list") return saved;
    } catch {
      /* ignore */
    }
    return "grid3";
  });
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);

  function changeLayout(next: LayoutMode) {
    setLayout(next);
    try {
      window.localStorage.setItem(LAYOUT_KEY, next);
    } catch {
      /* ignore */
    }
  }

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

  function StatsLine({ id }: { id: string }) {
    const s = analytics.byId[id];
    if (!s) return null;
    return (
      <div className="flex flex-wrap gap-3 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1">
          {s.views.toLocaleString("th-TH")} ชม.
        </span>
        <span className="inline-flex items-center gap-1 text-brand-red">
          <MousePointerClick className="size-3" />
          {s.quoteClicks} เสนอราคา
        </span>
      </div>
    );
  }

  function RowActions({ item }: { item: PortfolioItem }) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPreviewItem(item)}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs text-navy hover:bg-paper"
          title="พรีวิวหน้าผลงาน"
          aria-label="พรีวิว"
        >
          <Eye className="size-3.5" />
          <span className="hidden sm:inline">พรีวิว</span>
        </button>
        <button
          type="button"
          className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-brand-red"
          onClick={() => {
            if (
              !confirm("ลบออกจากรายการ? (demo — เก็บในเครื่องนี้เท่านั้น)")
            )
              return;
            removePortfolioItem(item.id);
            flash("ลบแล้ว (demo)");
          }}
          aria-label="ลบ"
        >
          <Trash2 className="size-3.5" />
        </button>
        <Link
          href={adminHref(basePath, `/cms/portfolio/${item.id}`)}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-red hover:underline"
        >
          <Pencil className="size-3.5" />
          แก้ไข
        </Link>
      </div>
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
              งานติดตั้งจริง — รูปช่าง/หน้างานเป็นหลัก ปักหมุดหน้าแรกได้
              <span className="ml-1">
                <DemoBadge />
              </span>
            </p>
          </div>
          <Link
            href={adminHref(basePath, "/cms/portfolio/new")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            <Plus className="size-4" />
            ลงผลงาน
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="เผยแพร่" value={counts.published} tone="green" />
          <StatPill label="ร่าง" value={counts.draft} tone="amber" />
          <StatPill label="ปักหมุดหน้าแรก" value={counts.pinned} />
        </div>
      </section>

      <PortfolioAnalyticsPanel items={items} basePath={basePath} />

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-line bg-paper p-0.5">
              <LayoutButton
                active={layout === "grid3"}
                onClick={() => changeLayout("grid3")}
                label="3 คอลัม"
                title="กริด 3 คอลัมน์"
              >
                <LayoutGrid className="size-4" />
                <span className="hidden sm:inline">3</span>
              </LayoutButton>
              <LayoutButton
                active={layout === "grid6"}
                onClick={() => changeLayout("grid6")}
                label="6 คอลัม"
                title="กริด 6 คอลัมน์"
              >
                <LayoutGrid className="size-3.5 opacity-90" />
                <span className="hidden sm:inline">6</span>
              </LayoutButton>
              <LayoutButton
                active={layout === "list"}
                onClick={() => changeLayout("list")}
                label="รายการ"
                title="แบบรายการ"
              >
                <LayoutList className="size-4" />
                <span className="hidden sm:inline">รายการ</span>
              </LayoutButton>
            </div>
            <label className="relative block min-w-[12rem] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาชื่อ / ที่ตั้ง / แท็ก"
                className="w-full rounded-xl border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-navy/40"
              />
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-paper px-4 py-12 text-center text-sm text-muted">
            ไม่พบผลงานตามตัวกรอง —{" "}
            <Link
              href={adminHref(basePath, "/cms/portfolio/new")}
              className="font-medium text-brand-red hover:underline"
            >
              ลงผลงานใหม่
            </Link>
          </div>
        ) : layout === "list" ? (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
              >
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-paper sm:size-24"
                  title="พรีวิว"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    {item.pinned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-red/10 px-2 py-0.5 text-[11px] font-medium text-brand-red">
                        <Pin className="size-3" />
                        หน้าแรก
                      </span>
                    ) : null}
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-navy">
                      {productLabel(item.productSlug)}
                    </span>
                  </div>
                  <h3 className="truncate font-display font-semibold text-navy">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted">{item.place}</p>
                  <p className="line-clamp-1 text-sm text-ink/80">{item.summary}</p>
                  <StatsLine id={item.id} />
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                  <button
                    type="button"
                    onClick={() => {
                      upsertPortfolioItem({ ...item, pinned: !item.pinned });
                      flash(item.pinned ? "เลิกปักหมุดแล้ว" : "ปักหมุดแล้ว");
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium",
                      item.pinned
                        ? "text-brand-red"
                        : "text-muted hover:text-navy",
                    )}
                  >
                    <Pin className="size-3.5" />
                    {item.pinned ? "เลิกปักหมุด" : "ปักหมุด"}
                  </button>
                  <RowActions item={item} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              layout === "grid3" && "sm:grid-cols-2 xl:grid-cols-3",
              layout === "grid6" &&
                "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6",
            )}
          >
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:border-navy/25"
              >
                <div className="relative">
                  <Link
                    href={adminHref(basePath, `/cms/portfolio/${item.id}`)}
                    className={cn(
                      "relative block bg-paper",
                      layout === "grid6" ? "aspect-square" : "aspect-[4/3]",
                    )}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes={
                        layout === "grid6"
                          ? "(max-width: 768px) 50vw, 16vw"
                          : "(max-width: 768px) 100vw, 33vw"
                      }
                    />
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                      <StatusBadge status={item.status} />
                      {item.pinned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-red px-2 py-0.5 text-[11px] font-medium text-white">
                          <Pin className="size-3" />
                          {layout === "grid6" ? "" : "หน้าแรก"}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="absolute bottom-2 right-2 z-10 inline-flex items-center justify-center rounded-full bg-white/95 p-2 text-navy shadow hover:bg-white"
                    title="พรีวิวหน้าผลงาน"
                    aria-label="พรีวิว"
                  >
                    <Eye className="size-4" />
                  </button>
                </div>
                <div
                  className={cn(
                    "space-y-2",
                    layout === "grid6" ? "p-2.5" : "p-4",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3
                        className={cn(
                          "truncate font-display font-semibold text-navy",
                          layout === "grid6" ? "text-sm" : "text-base",
                        )}
                      >
                        {item.title}
                      </h3>
                      {layout !== "grid6" ? (
                        <p className="text-xs text-muted">{item.place}</p>
                      ) : null}
                    </div>
                    {layout !== "grid6" ? (
                      <span className="shrink-0 rounded-full bg-paper px-2 py-0.5 text-[11px] text-navy">
                        {productLabel(item.productSlug)}
                      </span>
                    ) : null}
                  </div>
                  {layout !== "grid6" ? (
                    <p className="line-clamp-2 text-sm text-ink/80">
                      {item.summary}
                    </p>
                  ) : null}
                  {layout !== "grid6" ? <StatsLine id={item.id} /> : null}
                  <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        upsertPortfolioItem({ ...item, pinned: !item.pinned });
                        flash(item.pinned ? "เลิกปักหมุดแล้ว" : "ปักหมุดแล้ว");
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        item.pinned
                          ? "text-brand-red"
                          : "text-muted hover:text-navy",
                      )}
                    >
                      <Pin className="size-3.5" />
                      {layout === "grid6"
                        ? ""
                        : item.pinned
                          ? "เลิกปักหมุด"
                          : "ปักหมุด"}
                    </button>
                    <RowActions item={item} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <CmsSitePreview
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        title={previewItem?.title || "ผลงาน"}
        status={previewItem?.status}
      >
        {previewItem ? (
          <PortfolioDetailView
            item={previewItem}
            related={relatedPortfolio(previewItem, items)}
            preview
          />
        ) : null}
      </CmsSitePreview>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-navy px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function LayoutButton({
  active,
  onClick,
  label,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
        active
          ? "bg-navy text-white shadow-sm"
          : "text-muted hover:bg-white hover:text-navy",
      )}
    >
      {children}
    </button>
  );
}
