"use client";

import { useSyncExternalStore } from "react";
import { DEMO_BLOG, type BlogPost } from "@/lib/cms/blog-demo";
import {
  DEMO_PORTFOLIO,
  normalizePortfolioItem,
  type PortfolioItem,
} from "@/lib/cms/portfolio-demo";
import {
  DEMO_HERO_SLIDES,
  type HeroSlide,
} from "@/lib/cms/hero-slides-demo";
import {
  DEMO_CATALOGS,
  normalizeCatalog,
  type CatalogItem,
} from "@/lib/cms/catalogs-demo";
import {
  seedHomeSectionRecords,
  type PageSectionRecord,
  sectionStoreKey,
} from "@/lib/cms/page-sections";
import { DEMO_CAREERS, type JobPosting } from "@/lib/cms/careers-demo";
import type { CmsCollection } from "@/lib/cms/cms-collections";

type Listener = () => void;

function createDemoStore<T>(
  localKey: string,
  seed: T[],
  collection: CmsCollection,
) {
  let memory = seed;
  let hydrated = false;
  let remoteStarted = false;
  const listeners = new Set<Listener>();

  function notify() {
    listeners.forEach((l) => l());
  }

  function hydrateLocal() {
    if (typeof window === "undefined" || hydrated) return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(localKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        memory = parsed;
      }
    } catch {
      /* keep seed */
    }
  }

  function pullRemote() {
    if (typeof window === "undefined" || remoteStarted) return;
    remoteStarted = true;
    void fetch(`/api/public/cms/${collection}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { items?: T[] | null }) => {
        if (!Array.isArray(json.items) || json.items.length === 0) return;
        memory = json.items;
        hydrated = true;
        try {
          window.localStorage.setItem(localKey, JSON.stringify(json.items));
        } catch {
          /* ignore quota */
        }
        notify();
      })
      .catch(() => {
        /* keep local/seed */
      });
  }

  async function pushRemote(
    next: T[],
    deletedIds: string[] = [],
  ): Promise<{ ok: boolean; error?: string }> {
    if (typeof window === "undefined") {
      return { ok: false, error: "Not in browser" };
    }
    try {
      const res = await fetch(`/api/admin/cms/${collection}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: next, deletedIds }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        return {
          ok: false,
          error:
            json?.error ||
            `บันทึกขึ้นเซิร์ฟเวอร์ไม่สำเร็จ (${res.status})`,
        };
      }
      const latest = await fetch(`/api/public/cms/${collection}`, {
        cache: "no-store",
      })
        .then((r) => r.json())
        .catch(() => null);
      if (Array.isArray(latest?.items) && latest.items.length > 0) {
        memory = latest.items as T[];
        try {
          window.localStorage.setItem(localKey, JSON.stringify(latest.items));
        } catch {
          /* ignore quota */
        }
        notify();
      }
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "เครือข่ายล่ม บันทึกขึ้นเซิร์ฟเวอร์ไม่ได้",
      };
    }
  }

  function getSnapshot(): T[] {
    hydrateLocal();
    pullRemote();
    return memory;
  }

  function getServerSnapshot(): T[] {
    return seed;
  }

  function write(next: T[]): Promise<{ ok: boolean; error?: string }> {
    const prev = memory;
    const nextIds = new Set(
      next
        .map((item) => (item as { id?: string }).id)
        .filter((id): id is string => Boolean(id)),
    );
    const deletedIds = prev
      .map((item) => (item as { id?: string }).id)
      .filter(
        (id): id is string =>
          typeof id === "string" && id.length > 0 && !nextIds.has(id),
      );
    memory = next;
    hydrated = true;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(localKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      notify();
      return pushRemote(next, deletedIds);
    }
    notify();
    return Promise.resolve({ ok: true });
  }

  /**
   * Preview-only write: updates in-memory snapshot and notifies subscribers.
   * Does NOT touch localStorage or push to Supabase (prevents draft leaking live).
   */
  function applyPreview(next: T[]) {
    memory = next;
    hydrated = true;
    notify();
  }

  /** Seed from a server-rendered CMS snapshot before the public fetch returns. */
  function hydrateFromServer(items: T[]) {
    if (!Array.isArray(items) || items.length === 0) return;
    if (remoteStarted) return;
    memory = items;
    hydrated = true;
    notify();
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function read(): T[] {
    hydrateLocal();
    return memory;
  }

  return {
    subscribe,
    getSnapshot,
    getServerSnapshot,
    write,
    applyPreview,
    hydrateFromServer,
    read,
  };
}

const portfolioStore = createDemoStore<PortfolioItem>(
  "changtee.cms.portfolio.v1",
  DEMO_PORTFOLIO,
  "portfolio",
);
const blogStore = createDemoStore<BlogPost>(
  "changtee.cms.blog.v1",
  DEMO_BLOG,
  "blog",
);
const heroSlideStore = createDemoStore<HeroSlide>(
  "changtee.cms.hero-slides.v1",
  DEMO_HERO_SLIDES,
  "hero-slides",
);

const catalogStore = createDemoStore<CatalogItem>(
  "changtee.cms.catalogs.v1",
  DEMO_CATALOGS,
  "catalogs",
);

export function usePortfolioItems(): PortfolioItem[] {
  const raw = useSyncExternalStore(
    portfolioStore.subscribe,
    portfolioStore.getSnapshot,
    portfolioStore.getServerSnapshot,
  );
  return raw.map((item) => normalizePortfolioItem(item));
}

export function hydratePortfolioItems(items: PortfolioItem[]) {
  portfolioStore.hydrateFromServer(items.map((item) => normalizePortfolioItem(item)));
}

export function setPortfolioItems(items: PortfolioItem[]) {
  return portfolioStore.write(items.map((item) => normalizePortfolioItem(item)));
}

export function upsertPortfolioItem(item: PortfolioItem) {
  const next = normalizePortfolioItem(item);
  const prev = portfolioStore.read();
  const idx = prev.findIndex((p) => p.id === next.id);
  if (idx === -1) return setPortfolioItems([next, ...prev]);
  const copy = [...prev];
  copy[idx] = next;
  return setPortfolioItems(copy);
}

export function removePortfolioItem(id: string) {
  return setPortfolioItems(portfolioStore.read().filter((p) => p.id !== id));
}

export function getPortfolioById(id: string): PortfolioItem | undefined {
  return portfolioStore.read().find((p) => p.id === id);
}

export function useBlogPosts(): BlogPost[] {
  return useSyncExternalStore(
    blogStore.subscribe,
    blogStore.getSnapshot,
    blogStore.getServerSnapshot,
  );
}

export function setBlogPosts(posts: BlogPost[]) {
  return blogStore.write(posts);
}

export function upsertBlogPost(post: BlogPost) {
  const prev = blogStore.read();
  const idx = prev.findIndex((p) => p.id === post.id);
  if (idx === -1) return setBlogPosts([post, ...prev]);
  const copy = [...prev];
  copy[idx] = post;
  return setBlogPosts(copy);
}

export function getBlogById(id: string): BlogPost | undefined {
  return blogStore.read().find((p) => p.id === id);
}

export function useHeroSlides(): HeroSlide[] {
  return useSyncExternalStore(
    heroSlideStore.subscribe,
    heroSlideStore.getSnapshot,
    heroSlideStore.getServerSnapshot,
  );
}

export function setHeroSlides(slides: HeroSlide[]) {
  heroSlideStore.write(slides);
}

export function upsertHeroSlide(slide: HeroSlide) {
  const prev = heroSlideStore.read();
  const idx = prev.findIndex((p) => p.id === slide.id);
  if (idx === -1) setHeroSlides([slide, ...prev]);
  else {
    const copy = [...prev];
    copy[idx] = slide;
    setHeroSlides(copy);
  }
}

export function removeHeroSlide(id: string) {
  setHeroSlides(heroSlideStore.read().filter((p) => p.id !== id));
}

export function useCatalogs(): CatalogItem[] {
  const raw = useSyncExternalStore(
    catalogStore.subscribe,
    catalogStore.getSnapshot,
    catalogStore.getServerSnapshot,
  );
  return raw.map((item) => normalizeCatalog(item));
}

export function setCatalogs(items: CatalogItem[]) {
  catalogStore.write(items.map((item) => normalizeCatalog(item)));
}

export function upsertCatalog(item: CatalogItem) {
  const next = normalizeCatalog(item);
  const prev = catalogStore.read();
  const idx = prev.findIndex((p) => p.id === next.id);
  if (idx === -1) setCatalogs([next, ...prev]);
  else {
    const copy = [...prev];
    copy[idx] = next;
    setCatalogs(copy);
  }
}

export function removeCatalog(id: string) {
  setCatalogs(catalogStore.read().filter((p) => p.id !== id));
}

const pageSectionStore = createDemoStore<PageSectionRecord>(
  // v3: reset stale local seeds so home product tile art applies
  "changtee.cms.page-sections.v3",
  seedHomeSectionRecords(),
  "page-sections",
);

export function usePageSections(): PageSectionRecord[] {
  return useSyncExternalStore(
    pageSectionStore.subscribe,
    pageSectionStore.getSnapshot,
    pageSectionStore.getServerSnapshot,
  );
}

export function setPageSections(items: PageSectionRecord[]) {
  pageSectionStore.write(items);
}

export function upsertPageSection(record: PageSectionRecord) {
  const prev = pageSectionStore.read();
  const key = sectionStoreKey(record.pageKey, record.sectionId);
  const idx = prev.findIndex(
    (r) => sectionStoreKey(r.pageKey, r.sectionId) === key,
  );
  if (idx === -1) setPageSections([record, ...prev]);
  else {
    const copy = [...prev];
    copy[idx] = record;
    setPageSections(copy);
  }
}

/**
 * Apply page-section drafts in the preview iframe only.
 * Never persists to localStorage or Supabase.
 */
export function applyPreviewPageSections(records: PageSectionRecord[]) {
  const prev = pageSectionStore.read();
  const map = new Map(
    prev.map((r) => [sectionStoreKey(r.pageKey, r.sectionId), r]),
  );
  const now = new Date().toISOString();
  for (const rec of records) {
    const k = sectionStoreKey(rec.pageKey, rec.sectionId);
    const existing = map.get(k);
    map.set(k, {
      pageKey: rec.pageKey,
      sectionId: rec.sectionId,
      enabled: rec.enabled ?? existing?.enabled ?? true,
      values: rec.values,
      updatedAt: now,
    });
  }
  pageSectionStore.applyPreview([...map.values()]);
}

export function getPageSection(
  pageKey: string,
  sectionId: string,
): PageSectionRecord | undefined {
  const key = sectionStoreKey(pageKey, sectionId);
  return pageSectionStore
    .read()
    .find((r) => sectionStoreKey(r.pageKey, r.sectionId) === key);
}

export function ensurePageSections(records: PageSectionRecord[]) {
  const prev = pageSectionStore.read();
  const map = new Map(
    prev.map((r) => [sectionStoreKey(r.pageKey, r.sectionId), r]),
  );
  let changed = false;
  for (const rec of records) {
    const k = sectionStoreKey(rec.pageKey, rec.sectionId);
    if (!map.has(k)) {
      map.set(k, rec);
      changed = true;
    }
  }
  if (changed) setPageSections([...map.values()]);
}

export function useSectionValues(
  pageKey: string,
  sectionId: string,
  defaults: Record<string, string>,
): { values: Record<string, string>; enabled: boolean } {
  const sections = usePageSections();
  const rec = sections.find(
    (r) => r.pageKey === pageKey && r.sectionId === sectionId,
  );
  return {
    values: { ...defaults, ...(rec?.values ?? {}) },
    enabled: rec?.enabled ?? true,
  };
}

const careersStore = createDemoStore<JobPosting>(
  "changtee.cms.careers.v1",
  DEMO_CAREERS,
  "careers",
);

export function useJobPostings(): JobPosting[] {
  return useSyncExternalStore(
    careersStore.subscribe,
    careersStore.getSnapshot,
    careersStore.getServerSnapshot,
  );
}

export function setJobPostings(items: JobPosting[]) {
  careersStore.write(items);
}

export function upsertJobPosting(item: JobPosting) {
  const prev = careersStore.read();
  const idx = prev.findIndex((p) => p.id === item.id);
  if (idx === -1) setJobPostings([item, ...prev]);
  else {
    const copy = [...prev];
    copy[idx] = item;
    setJobPostings(copy);
  }
}

export function removeJobPosting(id: string) {
  setJobPostings(careersStore.read().filter((p) => p.id !== id));
}

export function getJobPostingById(id: string): JobPosting | undefined {
  return careersStore.read().find((p) => p.id === id);
}
