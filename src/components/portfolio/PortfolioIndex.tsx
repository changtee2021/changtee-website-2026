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
  productLabel,
  type PortfolioItem,
  type SpaceType,
} from "@/lib/cms/portfolio-demo";
import { publishedPortfolio } from "@/lib/cms/public-content";
import { usePortfolioItems } from "@/lib/cms/demo-store";
import { getCategory, productCatalog } from "@/lib/product-catalog";
import {
  IconAll,
  productFilterIcon,
  spaceFilterIcon,
  type FilterGraphicIcon,
} from "@/components/portfolio/portfolio-filter-icons";
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
  if (item.productSlug !== productSlug) return false;
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
  if (childSlugs.length === 0) return false;
  return childSlugs.some((slug) => matchesChild(item, productSlug, slug));
}

export function PortfolioIndex() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const items = usePortfolioItems();
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
      if (product !== "all" && i.productSlug !== product) return false;
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
      const list = map.get(item.productSlug) ?? [];
      list.push(item);
      map.set(item.productSlug, list);
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
      map.set(item.productSlug, (map.get(item.productSlug) ?? 0) + 1);
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
      if (product !== "all" && item.productSlug !== product) continue;
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
        if (i.productSlug !== product) return false;
        if (space !== "all" && i.spaceType !== space) return false;
        if (area !== "all" && placeArea(i.place) !== area) return false;
        if (!matchesQuery(i, qParam)) return false;
        return matchesChild(i, product, ch.slug);
      }).length;
      return { slug: ch.slug, name: ch.name, count };
    });
  }, [product, published, space, area, qParam]);

  const hasFilters =
    product !== "all" ||
    space !== "all" ||
    area !== "all" ||
    childSlugs.length > 0 ||
    qParam.length > 0;

  const activePills: { key: string; label: string; clear: () => void }[] = [];
  if (qParam)
    activePills.push({
      key: "q",
      label: `ค้นหา: ${qParam}`,
      clear: () => {
        setQDraft("");
        updateQuery({ q: "" });
      },
    });
  if (product !== "all")
    activePills.push({
      key: "product",
      label: productLabel(product),
      clear: () => updateQuery({ product: "all", child: [] }),
    });
  for (const slug of childSlugs) {
    const childName =
      getCategory(product)?.children.find((c) => c.slug === slug)?.name ?? slug;
    activePills.push({
      key: `child-${slug}`,
      label: childName,
      clear: () =>
        updateQuery({ child: childSlugs.filter((s) => s !== slug) }),
    });
  }
  if (space !== "all")
    activePills.push({
      key: "space",
      label: SPACE_TYPE_LABELS[space],
      clear: () => updateQuery({ space: "all" }),
    });
  if (area !== "all")
    activePills.push({
      key: "area",
      label: area,
      clear: () => updateQuery({ area: "all" }),
    });

  return (
    <div className="bg-shell pb-16">
      <PageHero
        image="/images/generated/ct-hero-portfolio.webp"
        imageAlt="ห้องนั่งเล่นคอนโดพร้อมผ้าม่านทึบแสงและผ้าโปร่งที่ติดตั้งโดยช่างตี๋"
        eyebrow={`${siteConfig.nameEn} · Install gallery`}
        title="Portfolio Gallery"
        description="รวมงานติดตั้งลูกค้า — ค้นหาตามสินค้า สถานที่ หรือม่านตรงกับใจคุณ"
        aside={<PortfolioHeroCovers items={published} />}
        align="bottom"
      />

      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 pt-8 sm:pt-10">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line sm:p-5">
          <div className="flex items-center gap-2">
            <div className="inline-flex shrink-0 rounded-full bg-shell p-1 ring-1 ring-line">
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

            <label className="relative min-w-0 flex-1">
              <span className="sr-only">ค้นหาผลงาน</span>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                type="search"
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
                placeholder="ค้นหา เช่น ม่านม้วน สุขุมวิท คอนโด ทึบแสง"
                className="w-full rounded-full border border-line bg-shell py-2.5 pl-10 pr-10 text-sm text-ink outline-none ring-navy/20 placeholder:text-muted focus:border-navy/40 focus:ring-2"
              />
              {qDraft ? (
                <button
                  type="button"
                  onClick={() => {
                    setQDraft("");
                    updateQuery({ q: "" });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-white hover:text-navy"
                  aria-label="ล้างคำค้น"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </label>

            <div className="relative shrink-0" ref={filterRef}>
              <button
                type="button"
                aria-label="ตัวกรอง"
                aria-expanded={filterOpen}
                onClick={() => setFilterOpen((o) => !o)}
                className={cn(
                  "relative flex size-11 items-center justify-center rounded-full border border-line bg-shell text-navy transition hover:border-navy/30",
                  filterOpen && "border-navy/40 ring-2 ring-navy/15",
                )}
              >
                <ListFilter className="size-4" strokeWidth={1.75} />
                {dropdownFiltersOn ? (
                  <span className="absolute right-2 top-2 size-1.5 rounded-full bg-brand-red" />
                ) : null}
              </button>
              {filterOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-[min(18rem,calc(100vw-2.5rem))] space-y-2 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-line">
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
                      className="w-full pt-1 text-center text-sm font-semibold text-brand-red hover:underline"
                    >
                      ล้างตัวกรอง
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* Icon strip — products or places */}
          <div className="mt-5 border-t border-line pt-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={reduced ? false : { opacity: 0, x: view === "place" ? 18 : -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reduced
                    ? undefined
                    : { opacity: 0, x: view === "place" ? -18 : 18 }
                }
                transition={{ duration: reduced ? 0 : 0.28, ease: fadeEase }}
                className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:gap-3"
              >
                <FilterIconBtn
                  active={
                    view === "product" ? product === "all" : space === "all"
                  }
                  label="ทั้งหมด"
                  icon={IconAll}
                  layoutId={`pf-active-${view}`}
                  reduced={!!reduced}
                  onClick={() =>
                    view === "product"
                      ? updateQuery({ product: "all", child: [] })
                      : updateQuery({ space: "all" })
                  }
                />
                {view === "product"
                  ? productCounts.map((c, i) => (
                      <FilterIconBtn
                        key={c.slug}
                        active={product === c.slug}
                        label={c.name}
                        icon={productFilterIcon(c.slug)}
                        muted={c.count === 0}
                        layoutId={`pf-active-${view}`}
                        reduced={!!reduced}
                        delay={reduced ? 0 : i * 0.02}
                        onClick={() => updateQuery({ product: c.slug })}
                      />
                    ))
                  : spaceCounts.map((s, i) => (
                      <FilterIconBtn
                        key={s.key}
                        active={space === s.key}
                        label={s.label}
                        icon={spaceFilterIcon(s.key)}
                        muted={s.count === 0}
                        layoutId={`pf-active-${view}`}
                        reduced={!!reduced}
                        delay={reduced ? 0 : i * 0.03}
                        onClick={() => updateQuery({ space: s.key })}
                      />
                    ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sub-categories when a product is selected */}
          <AnimatePresence initial={false}>
            {view === "product" &&
            product !== "all" &&
            childOptions.length > 0 ? (
              <motion.div
                key={`child-${product}`}
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduced ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: reduced ? 0 : 0.28, ease: fadeEase }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    หมวดย่อย · {productLabel(product)}
                  </p>
                  <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                    {childOptions.map((ch) => {
                      const selected = childSlugs.includes(ch.slug);
                      return (
                        <button
                          key={ch.slug}
                          type="button"
                          onClick={() => {
                            const next = selected
                              ? childSlugs.filter((s) => s !== ch.slug)
                              : [...childSlugs, ch.slug];
                            updateQuery({ child: next });
                          }}
                          className={cn(
                            "relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                            selected
                              ? "bg-navy text-white"
                              : "bg-shell text-navy ring-1 ring-line hover:ring-navy/30",
                            ch.count === 0 && !selected && "opacity-45",
                          )}
                        >
                          {ch.name}
                          <span className="ml-1 opacity-70">{ch.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {activePills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              {activePills.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={p.clear}
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-xs font-medium text-navy hover:bg-navy/10"
                >
                  {p.label}
                  <X className="size-3 opacity-60" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {product !== "all" ? (
          <div className="mt-6 flex items-baseline justify-end gap-3">
            <Link
              href={`/products/${product}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-brand-red"
            >
              ดูสินค้าหมวดนี้
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : null}

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
              childOptions.length > 0 &&
              childSlugs.length === 0 ? (
                <>
                  <p className="font-medium text-navy">เลือกหมวดย่อยเพื่อดูผลงาน</p>
                  <p className="mt-2 text-sm text-muted">
                    กดหมวดย่อยด้านบนได้มากกว่าหนึ่งรายการ
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
              className="mt-8 space-y-12"
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
                  <div className="mb-4 flex items-end justify-between gap-3 border-b border-line pb-3">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-navy">
                        {g.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted">{g.subtitle}</p>
                    </div>
                    <p className="text-sm text-muted">{g.items.length} งาน</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        "relative rounded-full px-3 py-1.5 text-sm font-semibold transition sm:px-4",
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
        className="w-full appearance-none rounded-full border border-line bg-shell py-2.5 pl-4 pr-9 text-sm font-medium text-navy outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/15"
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
  label,
  icon: Icon,
  muted,
  layoutId,
  reduced,
  delay = 0,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: FilterGraphicIcon;
  muted?: boolean;
  layoutId: string;
  reduced: boolean;
  delay?: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: muted && !active ? 0.42 : 1, y: 0 }}
      transition={{
        duration: reduced ? 0 : 0.28,
        delay,
        ease: fadeEase,
      }}
      whileTap={reduced ? undefined : { scale: 0.94 }}
      className={cn(
        "group relative flex w-[4.85rem] shrink-0 flex-col items-center gap-1.5 rounded-xl px-1 py-2",
        active ? "bg-navy/[0.04]" : "hover:bg-shell",
      )}
    >
      <span className="relative flex size-[3.6rem] items-center justify-center">
        {active ? (
          <motion.span
            layoutId={layoutId}
            className="absolute inset-0 rounded-2xl bg-white shadow-sm ring-2 ring-brand-red"
            transition={reduced ? { duration: 0 } : springSoft}
          />
        ) : (
          <span className="absolute inset-0 rounded-2xl bg-shell ring-2 ring-line transition group-hover:ring-navy/25" />
        )}
        <motion.span
          className="relative"
          animate={
            reduced ? undefined : active ? { scale: 1.06 } : { scale: 1 }
          }
          transition={springSoft}
        >
          <Icon active={active} className="size-8" />
        </motion.span>
      </span>
      <span
        className={cn(
          "line-clamp-2 text-center text-[11px] font-medium leading-tight",
          active ? "text-navy" : "text-muted",
        )}
      >
        {label}
      </span>
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
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, 360px"
        />
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
              {productLabel(item.productSlug)}
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
