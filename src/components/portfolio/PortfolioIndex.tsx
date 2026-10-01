"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, ListFilter, MapPin, Search, X } from "lucide-react";
import {
  SPACE_TYPE_LABELS,
  parseSpaceTypeParam,
  itemCategorySlugs,
  itemHasProduct,
  itemProductLabels,
  productLabel,
  type PortfolioItem,
  type SpaceType,
} from "@/lib/cms/portfolio-demo";
import { publishedPortfolio } from "@/lib/cms/public-content";
import { hydratePortfolioItems, usePortfolioItems } from "@/lib/cms/demo-store";
import { getCategory, productCatalog } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import { PortfolioHeroCovers } from "@/components/portfolio/PortfolioHeroCovers";

const springSoft = { type: "spring" as const, stiffness: 380, damping: 34 };
const fadeEase = [0.22, 1, 0.36, 1] as const;

type SpaceFilter = SpaceType | "all";
type ViewMode = "product" | "place";

function parseProduct(raw: string | null): string {
  const p = raw?.trim();
  if (p && productCatalog.some((c) => c.slug === p)) return p;
  return "all";
}

function parseSpace(raw: string | null): SpaceFilter {
  return parseSpaceTypeParam(raw) ?? "all";
}

function parseView(raw: string | null): ViewMode {
  return raw === "place" ? "place" : "product";
}

function parseChildren(raw: string | null, productSlug: string): string[] {
  if (!raw?.trim() || productSlug === "all") return [];
  const cat = getCategory(productSlug);
  if (!cat) return [];
  const allowed = new Set(cat.children.map((ch) => ch.slug));
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => allowed.has(s));
}

/** Take province/region from end of place string, e.g. "ลาดกระบัง กรุงเทพฯ" */
function placeArea(place: string): string {
  const parts = place.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "อื่นๆ";
  if (parts.length === 1) return parts[0]!;
  return parts[parts.length - 1]!;
}

function matchesQuery(item: PortfolioItem, q: string): boolean {
  if (!q) return true;
  const lineBits = item.lineItems.flatMap((r) => [
    r.productName,
    r.sku,
    r.serialOrCode,
    r.material,
    r.color,
    r.notes,
  ]);
  const hay = [
    item.title,
    item.summary,
    item.detail,
    item.place,
    item.customerName,
    item.installLocation,
    productLabel(item.productSlug),
    SPACE_TYPE_LABELS[item.spaceType],
    ...item.tags,
    ...lineBits,
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => hay.includes(token));
}

function matchesChild(item: PortfolioItem, productSlug: string, childSlug: string) {
  if (productSlug === "all") return true;
  if (!itemHasProduct(item, productSlug)) return false;
  const child = getCategory(productSlug)?.children.find((c) => c.slug === childSlug);
  if (!child) return true;
  const tokens = [child.slug, child.name, child.nameEn ?? ""]
    .join(" ")
    .toLowerCase()
    .split(/[\s/-]+/)
    .filter((t) => t.length > 1);
  const hay = [
    item.title,
    item.summary,
    item.detail,
    ...item.tags,
    ...item.lineItems.flatMap((r) => [r.productName, r.notes, r.material]),
  ]
    .join(" ")
    .toLowerCase();
  return tokens.some((t) => hay.includes(t));
}

function matchesAnyChild(
  item: PortfolioItem,
  productSlug: string,
  childSlugs: string[],
) {
  if (productSlug === "all") return true;
  if (childSlugs.length === 0) return true;
  return childSlugs.some((slug) => matchesChild(item, productSlug, slug));
}

export function PortfolioIndex({
  initialItems,
}: {
  initialItems?: PortfolioItem[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const stored = usePortfolioItems();
  useEffect(() => {
    if (initialItems?.length) hydratePortfolioItems(initialItems);
  }, [initialItems]);
  const items = useMemo(() => {
    const byId = new Map<string, PortfolioItem>();
    for (const item of initialItems ?? []) byId.set(item.id, item);
    for (const item of stored) {
      const prev = byId.get(item.id);
      if (
        !prev ||
        Date.parse(item.updatedAt || "0") >= Date.parse(prev.updatedAt || "0")
      ) {
        byId.set(item.id, item);
      }
    }
    return [...byId.values()];
  }, [initialItems, stored]);
  const published = useMemo(() => publishedPortfolio(items), [items]);

  const product = parseProduct(searchParams.get("product"));
  const space = parseSpace(searchParams.get("space"));
  const area = searchParams.get("area")?.trim() || "all";
  const view = parseView(searchParams.get("view"));
  const childSlugs = parseChildren(searchParams.get("child"), product);
  const qParam = searchParams.get("q")?.trim() ?? "";
  const resultsKey = `${view}|${product}|${space}|${area}|${childSlugs.join(",")}|${qParam}`;
  const [qDraft, setQDraft] = useState(qParam);
  const [qFromUrl, setQFromUrl] = useState(qParam);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  if (qParam !== qFromUrl) {
    setQFromUrl(qParam);
    setQDraft(qParam);
  }

  function updateQuery(next: {
    product?: string;
    space?: SpaceFilter;
    area?: string;
    view?: ViewMode;
    child?: string[];
    q?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextProduct = next.product ?? product;
    const nextSpace = next.space ?? space;
    const nextArea = next.area ?? area;
    const nextView = next.view ?? view;
    const nextQ = next.q !== undefined ? next.q : qParam;
    let nextChild = next.child !== undefined ? next.child : childSlugs;

    // Reset child when leaving the parent category
    if (next.product !== undefined && next.product !== product) {
      nextChild = [];
    }
    if (nextProduct === "all") nextChild = [];

    if (nextProduct === "all") params.delete("product");
    else params.set("product", nextProduct);

    if (nextSpace === "all") params.delete("space");
    else params.set("space", nextSpace);

    if (nextArea === "all") params.delete("area");
    else params.set("area", nextArea);

    if (nextView === "product") params.delete("view");
    else params.set("view", nextView);

    if (nextChild.length === 0) params.delete("child");
    else params.set("child", nextChild.join(","));

    if (!nextQ.trim()) params.delete("q");
    else params.set("q", nextQ.trim());

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (qDraft.trim() !== qParam) updateQuery({ q: qDraft });
    }, 280);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to draft changes
  }, [qDraft]);

  useEffect(() => {
    if (!filterOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!filterRef.current?.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [filterOpen]);

  const dropdownFiltersOn =
    area !== "all" ||
    (view === "product" ? space !== "all" : product !== "all");

  const areaOptions = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of published) {
      const a = placeArea(item.place);
      map.set(a, (map.get(a) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "th"));
  }, [published]);

  const filtered = useMemo(() => {
    return published.filter((i) => {
      if (product !== "all" && !itemHasProduct(i, product)) return false;
      if (space !== "all" && i.spaceType !== space) return false;
      if (area !== "all" && placeArea(i.place) !== area) return false;
      if (!matchesQuery(i, qParam)) return false;
      if (!matchesAnyChild(i, product, childSlugs)) return false;
      return true;
    });
  }, [published, product, space, area, qParam, childSlugs]);

  const productGroups = useMemo(() => {
    const order = productCatalog.map((c) => c.slug);
    const map = new Map<string, PortfolioItem[]>();
    for (const item of filtered) {
      for (const slug of itemCategorySlugs(item)) {
        const list = map.get(slug) ?? [];
        list.push(item);
        map.set(slug, list);
      }
    }
    return order
      .filter((slug) => map.has(slug))
      .map((slug) => ({
        key: slug,
        title: productLabel(slug),
        subtitle:
          productCatalog.find((c) => c.slug === slug)?.nameEn ?? slug,
        items: map.get(slug)!,
      }));
  }, [filtered]);

  const placeGroups = useMemo(() => {
    const map = new Map<string, PortfolioItem[]>();
    for (const item of filtered) {
      const a = placeArea(item.place);
      const list = map.get(a) ?? [];
      list.push(item);
      map.set(a, list);
    }
    return Array.from(map.entries())
      .map(([key, list]) => ({
        key,
        title: key,
        subtitle: `${list.length} งาน`,
        items: list,
      }))
      .sort(
        (a, b) =>
          b.items.length - a.items.length ||
          a.title.localeCompare(b.title, "th"),
      );
  }, [filtered]);

  const groups = view === "place" ? placeGroups : productGroups;

  /** Full product catalog with counts (incl. 0) */
  const productCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of published) {
      if (space !== "all" && item.spaceType !== space) continue;
      if (area !== "all" && placeArea(item.place) !== area) continue;
      if (!matchesQuery(item, qParam)) continue;
      for (const slug of itemCategorySlugs(item)) {
        map.set(slug, (map.get(slug) ?? 0) + 1);
      }
    }
    return productCatalog.map((c) => ({
      slug: c.slug,
      name: c.name,
      count: map.get(c.slug) ?? 0,
    }));
  }, [published, space, area, qParam]);

  const spaceCounts = useMemo(() => {
    const map = new Map<SpaceType, number>();
    for (const item of published) {
      if (product !== "all" && !itemHasProduct(item, product)) continue;
      if (area !== "all" && placeArea(item.place) !== area) continue;
      if (!matchesQuery(item, qParam)) continue;
      if (!matchesAnyChild(item, product, childSlugs)) continue;
      map.set(item.spaceType, (map.get(item.spaceType) ?? 0) + 1);
    }
    return (Object.keys(SPACE_TYPE_LABELS) as SpaceType[]).map((key) => ({
      key,
      label: SPACE_TYPE_LABELS[key],
      count: map.get(key) ?? 0,
    }));
  }, [published, product, area, qParam, childSlugs]);

  const childOptions = useMemo(() => {
    if (product === "all") return [];
    const cat = getCategory(product);
    if (!cat) return [];
    return cat.children.map((ch) => {
      const count = published.filter((i) => {
        if (!itemHasProduct(i, product)) return false;
        if (space !== "all" && i.spaceType !== space) return false;
        if (area !== "all" && placeArea(i.place) !== area) return false;
        if (!matchesQuery(i, qParam)) return false;
        return matchesChild(i, product, ch.slug);
      }).length;
      return { slug: ch.slug, name: ch.name, count };
    });
  }, [product, published, space, area, qParam]);

  // Hide sub-categories with no work yet (keep any already-selected one so it can be un-picked).
  const visibleChildOptions = useMemo(
    () => childOptions.filter((ch) => ch.count > 0 || childSlugs.includes(ch.slug)),
    [childOptions, childSlugs],
  );

  const hasFilters =
    product !== "all" ||
    space !== "all" ||
    area !== "all" ||
    childSlugs.length > 0 ||
    qParam.length > 0;

  return (
    <div className="bg-shell pb-16">
      <PageHero
        image="/images/generated/ct-hero-portfolio.webp"
        imageAlt="ห้องนั่งเล่นคอนโดพร้อมผ้าม่านทึบแสงและผ้าโปร่งที่ติดตั้งโดยช่างตี๋"
        eyebrow={`${siteConfig.nameEn} · Install gallery`}
        title="ผลงานติดตั้งผ้าม่าน"
        description="รวมงานติดตั้งลูกค้า — ค้นหาตามสินค้า สถานที่ หรือม่านตรงกับใจคุณ"
        aside={<PortfolioHeroCovers items={published} />}
        align="bottom"
        compact
      />

      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 pt-8 sm:pt-10">
        <div className="lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:items-start lg:gap-12">
          <aside className="mb-6 lg:sticky lg:top-24 lg:mb-0">
            <div className="flex flex-col gap-2">
              <label className="relative min-w-0">
                <span className="sr-only">ค้นหาผลงาน</span>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <input
                  type="search"
                  value={qDraft}
                  onChange={(e) => setQDraft(e.target.value)}
                  placeholder="ค้นหา เช่น ม่านม้วน สุขุมวิท"
                  className="min-h-9 w-full rounded-full border border-line bg-white py-1.5 pl-8 pr-8 text-[13px] text-ink outline-none ring-navy/20 placeholder:text-muted focus:border-navy/40 focus:ring-2"
                />
                {qDraft ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQDraft("");
                      updateQuery({ q: "" });
                    }}
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-navy"
                    aria-label="ล้างคำค้น"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </label>

              <div ref={filterRef}>
                <div className="flex items-center gap-2">
                  <div className="inline-flex min-w-0 flex-1 rounded-full bg-white p-0.5 ring-1 ring-line">
                    <ModeBtn
                      active={view === "product"}
                      reduced={!!reduced}
                      onClick={() => updateQuery({ view: "product" })}
                    >
                      สินค้า
                    </ModeBtn>
                    <ModeBtn
                      active={view === "place"}
                      reduced={!!reduced}
                      onClick={() => updateQuery({ view: "place" })}
                    >
                      สถานที่
                    </ModeBtn>
                  </div>
                  <button
                    type="button"
                    aria-label="ตัวกรอง"
                    aria-expanded={filterOpen}
                    onClick={() => setFilterOpen((o) => !o)}
                    className={cn(
                      "relative flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-navy transition hover:border-navy/30",
                      filterOpen && "border-navy/40 ring-2 ring-navy/15",
                    )}
                  >
                    <ListFilter className="size-3.5" strokeWidth={1.75} />
                    {dropdownFiltersOn ? (
                      <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-brand-red" />
                    ) : null}
                  </button>
                </div>
                {filterOpen ? (
                  <div className="mt-2 space-y-2 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-line">
                    {view === "product" ? (
                      <FilterSelect
                        label="ประเภทสถานที่"
                        value={space}
                        onChange={(v) => updateQuery({ space: v as SpaceFilter })}
                        options={[
                          { value: "all", label: `ทุกประเภท (${published.length})` },
                          ...spaceCounts.map((s) => ({
                            value: s.key,
                            label: `${s.label} (${s.count})`,
                          })),
                        ]}
                      />
                    ) : (
                      <FilterSelect
                        label="หมวดสินค้า"
                        value={product}
                        onChange={(v) => updateQuery({ product: v })}
                        options={[
                          { value: "all", label: `ทุกสินค้า (${published.length})` },
                          ...productCounts.map((c) => ({
                            value: c.slug,
                            label: `${c.name} (${c.count})`,
                          })),
                        ]}
                      />
                    )}
                    <FilterSelect
                      label="พื้นที่"
                      value={area}
                      onChange={(v) => updateQuery({ area: v })}
                      options={[
                        { value: "all", label: "ทุกพื้นที่" },
                        ...areaOptions.map((a) => ({
                          value: a.key,
                          label: `${a.key} (${a.count})`,
                        })),
                      ]}
                    />
                    {hasFilters ? (
                      <button
                        type="button"
                        onClick={() => {
                          setQDraft("");
                          updateQuery({
                            product: "all",
                            space: "all",
                            area: "all",
                            child: [],
                            q: "",
                          });
                        }}
                        className="min-h-11 w-full text-center text-sm font-semibold text-brand-red hover:underline"
                      >
                        ล้างตัวกรอง
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <nav
              aria-label={view === "product" ? "หมวดสินค้า" : "ประเภทสถานที่"}
              className="mt-2.5"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={view}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduced ? 0 : 0.22, ease: fadeEase }}
                  className="flex flex-col"
                >
                  <FilterIconBtn
                    active={
                      view === "product" ? product === "all" : space === "all"
                    }
                    label="ทั้งหมด"
                    reduced={!!reduced}
                    onClick={() =>
                      view === "product"
                        ? updateQuery({ product: "all", child: [] })
                        : updateQuery({ space: "all" })
                    }
                  />
                  {view === "product"
                    ? productCounts.map((c) => {
                        const open =
                          product === c.slug && visibleChildOptions.length > 0;
                        return (
                          <div key={c.slug}>
                            <FilterIconBtn
                              active={product === c.slug}
                              expanded={open}
                              label={c.name}
                              muted={c.count === 0}
                              reduced={!!reduced}
                              onClick={() =>
                                product === c.slug
                                  ? updateQuery({ product: "all", child: [] })
                                  : updateQuery({ product: c.slug })
                              }
                            />
                            <AnimatePresence initial={false}>
                              {open ? (
                                <motion.div
                                  key={`child-${c.slug}`}
                                  initial={
                                    reduced ? false : { opacity: 0, height: 0 }
                                  }
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={
                                    reduced
                                      ? undefined
                                      : { opacity: 0, height: 0 }
                                  }
                                  transition={{
                                    duration: reduced ? 0 : 0.22,
                                    ease: fadeEase,
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="mb-1 ml-3 border-l border-line py-1 pl-2">
                                    <div className="flex flex-col gap-0.5">
                                      {visibleChildOptions.map((ch) => {
                                        const selected = childSlugs.includes(
                                          ch.slug,
                                        );
                                        return (
                                          <button
                                            key={ch.slug}
                                            type="button"
                                            onClick={() => {
                                              // One sub-category at a time: show only that page's works.
                                              updateQuery({
                                                child: selected ? [] : [ch.slug],
                                              });
                                            }}
                                            className={cn(
                                              "flex min-h-8 w-full items-center justify-between gap-2 rounded-md px-2.5 text-left text-[13px] font-medium transition",
                                              selected
                                                ? "bg-navy text-white"
                                                : "text-navy hover:bg-paper",
                                              ch.count === 0 &&
                                                !selected &&
                                                "opacity-45",
                                            )}
                                          >
                                            <span className="min-w-0 truncate">
                                              {ch.name}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    : spaceCounts.map((s) => (
                        <FilterIconBtn
                          key={s.key}
                          active={space === s.key}
                          label={s.label}
                          muted={s.count === 0}
                          reduced={!!reduced}
                          onClick={() => updateQuery({ space: s.key })}
                        />
                      ))}
                </motion.div>
              </AnimatePresence>
            </nav>
          </aside>

          <div className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: fadeEase }}
              className="mt-10 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center"
            >
              {view === "product" &&
              product !== "all" &&
              visibleChildOptions.length > 0 &&
              childSlugs.length === 0 ? (
                <>
                  <p className="font-medium text-navy">เลือกหมวดย่อยเพื่อดูผลงาน</p>
                  <p className="mt-2 text-sm text-muted">
                    กดหมวดย่อยทางซ้ายเพื่อดูผลงานของหมวดนั้น
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-navy">ไม่เจอผลงานตามเงื่อนไขนี้</p>
                  <p className="mt-2 text-sm text-muted">
                    ลองเปลี่ยนคำค้น หรือล้างตัวกรองแล้วเลือกใหม่
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQDraft("");
                      updateQuery({
                        product: "all",
                        space: "all",
                        area: "all",
                        child: [],
                        q: "",
                      });
                    }}
                    className="mt-5 text-sm font-semibold text-brand-red hover:underline"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={resultsKey}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: reduced ? 0 : 0.32, ease: fadeEase }}
              className="space-y-12"
            >
              {groups.map((g, gi) => (
                <motion.section
                  key={g.key}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.35,
                    delay: reduced ? 0 : gi * 0.05,
                    ease: fadeEase,
                  }}
                >
                  <div
                    className={cn(
                      "mb-4 flex justify-between gap-3 border-b border-line pb-3",
                      product !== "all" && gi === 0 ? "items-start" : "items-end",
                    )}
                  >
                    <div className="min-w-0">
                      <h2 className="font-display text-3xl font-normal tracking-tight text-navy sm:text-4xl">
                        {g.title}
                      </h2>
                      <p className="mt-1 text-lg font-normal text-muted">{g.subtitle}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {product !== "all" && gi === 0 ? (
                        <Link
                          href={`/products/${product}`}
                          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy hover:text-brand-red"
                        >
                          ดูสินค้าหมวดนี้
                          <ArrowRight className="size-3.5" />
                        </Link>
                      ) : null}
                      <p className="text-sm text-muted">{g.items.length} งาน</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {g.items.map((item, ii) => (
                      <motion.div
                        key={item.id}
                        initial={reduced ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: reduced ? 0 : 0.3,
                          delay: reduced ? 0 : Math.min(ii, 7) * 0.035,
                          ease: fadeEase,
                        }}
                      >
                        <GalleryCard
                          item={item}
                          showProduct={view === "place"}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>

        <section className="mt-16 rounded-[1.5rem] bg-navy px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-md">
              <h2 className="font-display text-xl font-semibold sm:text-2xl">
                อยากได้สไตล์ใกล้เคียงงานเหล่านี้?
              </h2>
              <p className="mt-2 text-sm text-white/70">
                ส่งรูปห้องมาทาง LINE หรือขอใบเสนอราคา — ทีมงานช่วยจับคู่แบบให้
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/quote"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-white/90"
              >
                ขอใบเสนอราคา
              </Link>
              <a
                href={siteConfig.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#06C755] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                คุยทาง LINE
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ModeBtn({
  active,
  reduced,
  onClick,
  children,
}: {
  active: boolean;
  reduced: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative min-h-9 flex-1 rounded-full px-2.5 py-1 text-[13px] font-semibold transition",
        active ? "text-white" : "text-muted hover:text-navy",
      )}
    >
      {active ? (
        <motion.span
          layoutId="pf-mode-pill"
          className="absolute inset-0 rounded-full bg-navy"
          transition={reduced ? { duration: 0 } : springSoft}
        />
      ) : null}
      <span className="relative">{children}</span>
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-full border border-line bg-shell py-1.5 pl-3 pr-8 text-[13px] font-medium text-navy outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/15"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </label>
  );
}

function FilterIconBtn({
  active,
  expanded,
  label,
  muted,
  reduced,
  onClick,
}: {
  active: boolean;
  expanded?: boolean;
  label: string;
  muted?: boolean;
  reduced: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      aria-expanded={expanded}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: muted && !active ? 0.42 : 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.22, ease: fadeEase }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      className={cn(
        "flex min-h-9 w-full items-center rounded-lg px-2.5 py-1 text-left text-[13px] font-medium leading-tight",
        active ? "bg-navy/[0.06] text-navy" : "text-muted hover:bg-paper",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </motion.button>
  );
}

function GalleryCard({
  item,
  showProduct,
}: {
  item: PortfolioItem;
  showProduct: boolean;
}) {
  /** Second photo of this job (first gallery image that differs from the cover). */
  const secondImage = item.gallery.find((src) => src && src !== item.image);

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line transition hover:ring-navy/25"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className={cn(
            "object-cover transition duration-500 ease-out motion-reduce:transition-none",
            secondImage
              ? "group-hover:-translate-x-full"
              : "group-hover:scale-[1.03]",
          )}
          sizes="(max-width: 640px) 100vw, 360px"
        />
        {secondImage ? (
          <Image
            src={secondImage}
            alt=""
            aria-hidden
            fill
            className="translate-x-full object-cover transition duration-500 ease-out group-hover:translate-x-0 motion-reduce:transition-none"
            sizes="(max-width: 640px) 100vw, 360px"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 to-transparent p-3 pt-10">
          <p className="flex items-center gap-1 text-[11px] font-medium text-white/90">
            <MapPin className="size-3 shrink-0 opacity-80" aria-hidden />
            <span className="truncate">{item.place}</span>
          </p>
        </div>
      </div>
      <div className="p-4">
        <p className="truncate text-[11px] text-muted">
          {showProduct ? (
            <>
              {itemProductLabels(item)}
              <span className="mx-1.5 text-line">·</span>
              {SPACE_TYPE_LABELS[item.spaceType]}
            </>
          ) : (
            SPACE_TYPE_LABELS[item.spaceType]
          )}
        </p>
        <h3 className="mt-1.5 line-clamp-2 font-display text-base font-semibold leading-snug text-navy transition group-hover:text-brand-red">
          {item.title}
        </h3>
      </div>
    </Link>
  );
}
