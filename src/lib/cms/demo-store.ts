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

type Listener = () => void;

function createDemoStore<T>(key: string, seed: T[]) {
  let memory = seed;
  let hydrated = false;
  const listeners = new Set<Listener>();

  function hydrate() {
    if (typeof window === "undefined" || hydrated) return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        memory = parsed;
      }
    } catch {
      /* keep seed */
    }
  }

  function getSnapshot(): T[] {
    hydrate();
    return memory;
  }

  function getServerSnapshot(): T[] {
    return seed;
  }

  function write(next: T[]) {
    memory = next;
    hydrated = true;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(next));
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function read(): T[] {
    hydrate();
    return memory;
  }

  return { subscribe, getSnapshot, getServerSnapshot, write, read };
}

const portfolioStore = createDemoStore<PortfolioItem>(
  "changtee.cms.portfolio.v1",
  DEMO_PORTFOLIO,
);
const blogStore = createDemoStore<BlogPost>("changtee.cms.blog.v1", DEMO_BLOG);
const heroSlideStore = createDemoStore<HeroSlide>(
  "changtee.cms.hero-slides.v1",
  DEMO_HERO_SLIDES,
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
