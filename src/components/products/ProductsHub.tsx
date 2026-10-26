"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import {
  PRODUCT_PILLARS,
  childImage,
  hubItemsForPillar,
  productCatalog,
  type ProductCategory,
} from "@/lib/product-catalog";
import { PageHero } from "@/components/ui/page-hero";
import { ProductHeroCovers } from "@/components/products/ProductHeroCovers";
import { catalogName, categorySummary, pillarSummary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locale";
import { useI18n } from "@/lib/i18n/use-i18n";
import { useTx } from "@/lib/i18n/use-tx";
import { cn } from "@/lib/utils";

function hubItemQueryParts(item: { href: string; name: string; nameEn?: string; summary: string }) {
  const parts = item.href.split("/").filter(Boolean);
  const category =
    parts.length === 2 && parts[0] === "products"
      ? productCatalog.find((cat) => cat.slug === parts[1])
      : undefined;
  return [
    item.name,
    item.nameEn,
    item.summary,
    ...(category?.children.flatMap((child) => [child.name, child.nameEn, child.summary]) ?? []),
  ];
}

function matchesQuery(query: string, parts: Array<string | undefined>) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const hay = parts.filter(Boolean).join(" ").toLowerCase();
  return tokens.every((token) => hay.includes(token));
}

const HERO_COVERS = PRODUCT_PILLARS.flatMap((p) => hubItemsForPillar(p.id));

export function ProductsHub() {
  const { t, locale } = useI18n();
  const { find, tx } = useTx();
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState("all");

  const visibleCategories = useMemo(
    () =>
      productCatalog.filter((cat) =>
        matchesQuery(query, [
          cat.name,
          cat.nameEn,
          cat.summary,
          ...cat.children.flatMap((child) => [child.name, child.nameEn, child.summary]),
        ]),
      ),
    [query],
  );

  const activeCategory =
    activeSlug === "all"
      ? null
      : productCatalog.find((cat) => cat.slug === activeSlug) ?? null;
  const shownCategory =
    activeCategory && visibleCategories.some((cat) => cat.slug === activeCategory.slug)
      ? activeCategory
      : null;

  return (
    <div>
      <PageHero
        image="/images/generated/ct-hero-products.webp"
        imageAlt={t("products.heroAlt")}
        eyebrow="Product & Service · Chang Tee"
        title={t("products.hubTitle")}
        description={t("products.hubDesc")}
        aside={<ProductHeroCovers items={HERO_COVERS} />}
        align="bottom"
        compact
      />

      <div className="bg-shell">
      <div className="mx-auto max-w-site px-6 pt-8 sm:px-10 sm:pt-10 lg:px-16">
        <div className="lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:items-start lg:gap-12">
          <ProductCategorySidebar
            query={query}
            onQuery={setQuery}
            categories={visibleCategories}
            activeSlug={activeCategory?.slug ?? "all"}
            onSelect={setActiveSlug}
            allLabel={tx("ทั้งหมด")}
            navLabel={t("products.hubNav")}
            locale={locale}
            find={find}
          />

          <div className="min-w-0">
            {shownCategory ? (
              <CategoryProducts
                category={shownCategory}
                query={query}
                locale={locale}
                find={find}
                tx={tx}
                itemsLabel={t("products.items")}
              />
            ) : (
              <div className="space-y-14">
                {PRODUCT_PILLARS.map((pillar) => {
                  const items = hubItemsForPillar(pillar.id).filter((item) =>
                    matchesQuery(query, hubItemQueryParts(item)),
                  );
                  if (items.length === 0) return null;
                  return (
                    <section
                      key={pillar.id}
                      id={`pillar-${pillar.id}`}
                      className="scroll-mt-24"
                    >
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-brand-red">
                          {pillar.code} · {pillar.nameEn}
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-semibold text-navy">
                          {catalogName(locale, pillar, find)}
                        </h2>
                        <p className="mt-1 max-w-xl text-sm text-muted">
                          {pillarSummary(locale, pillar, find)}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                          <ProductCard
                            key={item.href}
                            href={item.href}
                            image={item.image}
                            title={catalogName(locale, item, find)}
                            subtitle={
                              locale === "th"
                                ? item.nameEn
                                : locale === "en"
                                  ? item.name
                                  : undefined
                            }
                            summary={categorySummary(
                              locale,
                              {
                                slug: item.href.split("/")[2] ?? "",
                                summary: item.summary,
                              },
                              find,
                            )}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
                {query.trim() &&
                PRODUCT_PILLARS.every(
                  (pillar) =>
                    hubItemsForPillar(pillar.id).filter((item) =>
                      matchesQuery(query, hubItemQueryParts(item)),
                    ).length === 0,
                ) ? (
                  <p className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center text-sm text-muted">
                    ไม่เจอสินค้าตามคำค้น
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 pb-16">
          <Link
            href="/quote"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-red px-5 text-sm font-semibold text-white hover:bg-brand-red-soft"
          >
            {t("nav.quote")}
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex min-h-11 items-center rounded-full border border-navy px-5 text-sm font-semibold text-navy hover:bg-paper"
          >
            {t("home.seeWork")}
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}

function ProductCategorySidebar({
  query,
  onQuery,
  categories,
  activeSlug,
  onSelect,
  allLabel,
  navLabel,
  locale,
  find,
}: {
  query: string;
  onQuery: (value: string) => void;
  categories: ProductCategory[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  allLabel: string;
  navLabel: string;
  locale: Locale;
  find: (thai: string) => string | undefined;
}) {
  return (
    <aside className="mb-6 lg:sticky lg:top-24 lg:mb-0">
      <label className="relative block min-w-0">
        <span className="sr-only">ค้นหาสินค้า</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="ค้นหา เช่น ม่านม้วน"
          className="min-h-11 w-full rounded-full border border-line bg-white py-1.5 pl-8 pr-12 text-sm text-ink outline-none ring-navy/20 placeholder:text-muted focus:border-navy/40 focus:ring-2 sm:min-h-9 sm:text-[13px]"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-navy sm:size-8"
            aria-label="ล้างคำค้น"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </label>

      <nav aria-label={navLabel} className="mt-2.5 flex flex-col">
        <button
          type="button"
          onClick={() => onSelect("all")}
          aria-current={activeSlug === "all" ? "true" : undefined}
          className={cn(
            "flex min-h-11 w-full items-center rounded-lg px-2.5 text-left text-sm font-medium sm:min-h-9 sm:text-[13px]",
            activeSlug === "all"
              ? "bg-navy/[0.06] text-navy"
              : "text-muted hover:bg-paper",
          )}
        >
          {allLabel}
        </button>
        {categories.map((cat) => {
          const active = activeSlug === cat.slug;
          return (
            <div key={cat.slug}>
              <button
                type="button"
                onClick={() => onSelect(active ? "all" : cat.slug)}
                aria-current={active ? "true" : undefined}
                aria-expanded={active}
                className={cn(
                  "flex min-h-11 w-full items-center rounded-lg px-2.5 text-left text-sm font-medium sm:min-h-9 sm:text-[13px]",
                  active ? "bg-navy/[0.06] text-navy" : "text-muted hover:bg-paper",
                )}
              >
                <span className="min-w-0 flex-1 truncate">
                  {catalogName(locale, cat, find)}
                </span>
              </button>
              {active ? (
                <div className="mb-1 ml-3 border-l border-line py-1 pl-2">
                  {cat.children.map((child) => (
                    <Link
                      key={child.slug}
                      href={`/products/${cat.slug}/${child.slug}`}
                      className="flex min-h-11 items-center rounded-md px-2.5 text-sm font-medium text-navy hover:bg-paper sm:min-h-9 sm:text-[13px]"
                    >
                      <span className="min-w-0 truncate">
                        {catalogName(locale, child, find)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function CategoryProducts({
  category,
  query,
  locale,
  find,
  tx,
  itemsLabel,
}: {
  category: ProductCategory;
  query: string;
  locale: Locale;
  find: (thai: string) => string | undefined;
  tx: (thai: string) => string;
  itemsLabel: string;
}) {
  const children = category.children.filter((child) =>
    matchesQuery(query, [child.name, child.nameEn, child.summary, category.name]),
  );
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-normal tracking-tight text-navy sm:text-4xl">
            {catalogName(locale, category, find)}
          </h2>
          <p className="mt-1 text-lg text-muted">
            {locale === "en" ? category.name : category.nameEn}
          </p>
        </div>
        <p className="shrink-0 text-sm text-muted">
          {children.length} {itemsLabel}
        </p>
      </div>
      {children.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center text-sm text-muted">
          ไม่เจอสินค้าตามคำค้น
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <ProductCard
              key={child.slug}
              href={`/products/${category.slug}/${child.slug}`}
              image={childImage(category, child)}
              title={catalogName(locale, child, find)}
              subtitle={locale === "en" ? child.name : child.nameEn}
              summary={tx(child.summary)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProductCard({
  href,
  image,
  title,
  subtitle,
  summary,
}: {
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  summary: string;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:border-navy/30 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-paper">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-navy group-hover:text-brand-red">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
        <div className="mt-2 h-px w-8 bg-brand-red" aria-hidden />
        <p className="mt-2 line-clamp-2 text-sm text-muted">{summary}</p>
      </div>
    </Link>
  );
}
