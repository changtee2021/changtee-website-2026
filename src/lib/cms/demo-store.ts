"use client";

import { useSyncExternalStore } from "react";
import { DEMO_BLOG, type BlogPost } from "@/lib/cms/blog-demo";
import { DEMO_PORTFOLIO, type PortfolioItem } from "@/lib/cms/portfolio-demo";
import {
  DEMO_HERO_SLIDES,
  type HeroSlide,
} from "@/lib/cms/hero-slides-demo";
import {
  seedHomeSectionRecords,
  type PageSectionRecord,
  sectionStoreKey,
} from "@/lib/cms/page-sections";
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

  function pushRemote(next: T[]) {
    if (typeof window === "undefined") return;
    void fetch(`/api/admin/cms/${collection}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: next }),
    }).catch(() => {
      /* offline / not logged in — local still updated */
    });
  }

  function getSnapshot(): T[] {
    hydrateLocal();
    pullRemote();
    return memory;
  }

  function getServerSnapshot(): T[] {
    return seed;
  }

  function write(next: T[]) {
    memory = next;
    hydrated = true;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(localKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      pushRemote(next);
    }
    notify();
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

export function usePortfolioItems(): PortfolioItem[] {
  return useSyncExternalStore(
    portfolioStore.subscribe,
    portfolioStore.getSnapshot,
    portfolioStore.getServerSnapshot,
  );
}

export function setPortfolioItems(items: PortfolioItem[]) {
  portfolioStore.write(items);
}

export function upsertPortfolioItem(item: PortfolioItem) {
  const prev = portfolioStore.read();
  const idx = prev.findIndex((p) => p.id === item.id);
  if (idx === -1) setPortfolioItems([item, ...prev]);
  else {
    const copy = [...prev];
    copy[idx] = item;
    setPortfolioItems(copy);
  }
}

export function removePortfolioItem(id: string) {
  setPortfolioItems(portfolioStore.read().filter((p) => p.id !== id));
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
  blogStore.write(posts);
}

export function upsertBlogPost(post: BlogPost) {
  const prev = blogStore.read();
  const idx = prev.findIndex((p) => p.id === post.id);
  if (idx === -1) setBlogPosts([post, ...prev]);
  else {
    const copy = [...prev];
    copy[idx] = post;
    setBlogPosts(copy);
  }
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

const pageSectionStore = createDemoStore<PageSectionRecord>(
  "changtee.cms.page-sections.v1",
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
