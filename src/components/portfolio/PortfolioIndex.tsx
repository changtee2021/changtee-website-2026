"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import {
  SPACE_TYPE_LABELS,
  productLabel,
  type PortfolioItem,
  type SpaceType,
} from "@/lib/cms/portfolio-demo";
import { publishedPortfolio } from "@/lib/cms/public-content";
import { usePortfolioItems } from "@/lib/cms/demo-store";
import { productCatalog } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type SpaceFilter = SpaceType | "all";

function parseProduct(raw: string | null): string {
  const p = raw?.trim();
  if (p && productCatalog.some((c) => c.slug === p)) return p;
  return "all";
}

function parseSpace(raw: string | null): SpaceFilter {
  const s = raw?.trim();
  if (s === "all") return "all";
  if (s && s in SPACE_TYPE_LABELS) return s as SpaceType;
  return "all";
}

export function PortfolioIndex() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const items = usePortfolioItems();
  const published = useMemo(() => publishedPortfolio(items), [items]);

  const product = parseProduct(searchParams.get("product"));
  const space = parseSpace(searchParams.get("space"));

  function updateQuery(next: { product?: string; space?: SpaceFilter }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextProduct = next.product ?? product;
    const nextSpace = next.space ?? space;

    if (nextProduct === "all") params.delete("product");
    else params.set("product", nextProduct);

    if (nextSpace === "all") params.delete("space");
    else params.set("space", nextSpace);

    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of published) {
      counts.set(item.productSlug, (counts.get(item.productSlug) ?? 0) + 1);
    }
    return productCatalog
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        nameEn: c.nameEn,
        image: c.image,
        count: counts.get(c.slug) ?? 0,
      }))
      .filter((c) => c.count > 0);
  }, [published]);

  const spaceCounts = useMemo(() => {
    const base =
      product === "all"
        ? published
        : published.filter((i) => i.productSlug === product);
    const map = new Map<SpaceType, number>();
    for (const item of base) {
      map.set(item.spaceType, (map.get(item.spaceType) ?? 0) + 1);
    }
    return (Object.keys(SPACE_TYPE_LABELS) as SpaceType[])
      .map((key) => ({ key, label: SPACE_TYPE_LABELS[key], count: map.get(key) ?? 0 }))
      .filter((s) => s.count > 0);
  }, [published, product]);

  const filtered = useMemo(() => {
    return published.filter((i) => {
      if (product !== "all" && i.productSlug !== product) return false;
      if (space !== "all" && i.spaceType !== space) return false;
      return true;
    });
  }, [published, product, space]);

  const grouped = useMemo(() => {
    if (product !== "all") return null;
    return categories
      .map((cat) => ({
        ...cat,
        items: filtered.filter((i) => i.productSlug === cat.slug),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, filtered, product]);

  const activeCategory = categories.find((c) => c.slug === product);
  const totalLabel =
    product === "all"
      ? `${filtered.length} ผลงาน`
      : `${filtered.length} ผลงานในหมวด${activeCategory?.name ?? productLabel(product)}`;

  return (
    <div className="bg-shell pb-16">
      {/* Header */}
      <section className="border-b border-line/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {siteConfig.nameEn} · Install gallery
          </p>
          <h1 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            ผลงานติดตั้งของช่างตี๋
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            เลือกหมวดสินค้าที่สนใจ แล้วเลื่อนดูงานจริงจากหน้างานบ้าน คอนโด ร้าน
            และองค์กร
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:pt-10">
        {/* Category browse */}
        <section aria-label="หมวดผลงาน">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
                เลือกหมวด
              </h2>
              <p className="mt-1 text-sm text-muted">
                กดหมวดเพื่อดูเฉพาะงานนั้น — หรือดูทั้งหมดแบบแยกหมวด
              </p>
            </div>
            {product !== "all" || space !== "all" ? (
              <button
                type="button"
                onClick={() => updateQuery({ product: "all", space: "all" })}
                className="shrink-0 text-sm font-semibold text-brand-red hover:underline"
              >
                ล้างตัวกรอง
              </button>
            ) : null}
          </div>

          <div className="no-scrollbar mt-5 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            <CategoryCard
              active={product === "all"}
              title="ทั้งหมด"
              subtitle={`${published.length} งาน`}
              image={published[0]?.image ?? "/images/generated/ct-pf-home.webp"}
              onClick={() => updateQuery({ product: "all" })}
            />
            {categories.map((cat) => (
              <CategoryCard
                key={cat.slug}
                active={product === cat.slug}
                title={cat.name}
                subtitle={`${cat.count} งาน`}
                image={cat.image}
                onClick={() => updateQuery({ product: cat.slug })}
              />
            ))}
          </div>
        </section>

        {/* Space filter — secondary, only types that exist */}
        {spaceCounts.length > 0 ? (
          <section className="mt-8" aria-label="ประเภทสถานที่">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              ประเภทสถานที่
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SpaceChip
                active={space === "all"}
                onClick={() => updateQuery({ space: "all" })}
              >
                ทุกประเภท
              </SpaceChip>
              {spaceCounts.map((s) => (
                <SpaceChip
                  key={s.key}
                  active={space === s.key}
                  onClick={() => updateQuery({ space: s.key })}
                >
                  {s.label}
                  <span className="ml-1 text-[11px] opacity-70">{s.count}</span>
                </SpaceChip>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-8 flex items-baseline justify-between gap-3 border-t border-line pt-6">
          <p className="text-sm text-muted">{totalLabel}</p>
          {product !== "all" ? (
            <Link
              href={`/products/${product}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-brand-red"
            >
              ดูสินค้าหมวดนี้
              <ArrowRight className="size-3.5" />
            </Link>
          ) : null}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
            <p className="font-medium text-navy">ยังไม่มีผลงานในตัวกรองนี้</p>
            <p className="mt-2 text-sm text-muted">
              ลองเปลี่ยนหมวดหรือประเภทสถานที่ — หรือล้างตัวกรอง
            </p>
            <button
              type="button"
              onClick={() => updateQuery({ product: "all", space: "all" })}
              className="mt-5 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
            >
              ดูผลงานทั้งหมด
            </button>
          </div>
        ) : product === "all" && grouped ? (
          <div className="mt-8 space-y-14">
            {grouped.map((group) => (
              <section key={group.slug} aria-labelledby={`cat-${group.slug}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {group.nameEn}
                    </p>
                    <h2
                      id={`cat-${group.slug}`}
                      className="mt-1 font-display text-2xl font-semibold text-navy"
                    >
                      {group.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateQuery({ product: group.slug })}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red hover:underline"
                  >
                    ดูเฉพาะหมวดนี้
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <WorkCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <WorkCard key={item.id} item={item} showProduct={false} />
            ))}
          </div>
        )}

        {/* Soft CTA */}
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

function CategoryCard({
  active,
  title,
  subtitle,
  image,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  image: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative h-[9.5rem] w-[9.5rem] shrink-0 overflow-hidden rounded-2xl text-left transition sm:h-40 sm:w-40",
        "outline outline-2 outline-offset-2",
        active
          ? "outline-brand-red"
          : "outline-transparent hover:outline-navy/25",
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        className="object-cover transition duration-500 group-hover:scale-[1.04]"
        sizes="160px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-display text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-[11px] text-white/75">{subtitle}</p>
      </div>
      {active ? (
        <span className="absolute right-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-semibold text-white">
          เลือกอยู่
        </span>
      ) : null}
    </button>
  );
}

function SpaceChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "bg-navy text-white"
          : "bg-white text-navy ring-1 ring-line hover:ring-navy/30",
      )}
    >
      {children}
    </button>
  );
}

function WorkCard({
  item,
  showProduct = true,
}: {
  item: PortfolioItem;
  showProduct?: boolean;
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
            {item.place}
          </p>
        </div>
      </div>
      <div className="p-4">
        {showProduct ? (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {productLabel(item.productSlug)}
            <span className="mx-1.5 text-line">·</span>
            {SPACE_TYPE_LABELS[item.spaceType]}
          </p>
        ) : (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {SPACE_TYPE_LABELS[item.spaceType]}
          </p>
        )}
        <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-navy transition group-hover:text-brand-red">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
          {item.summary}
        </p>
      </div>
    </Link>
  );
}
