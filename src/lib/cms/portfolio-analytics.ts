"use client";

import { useSyncExternalStore } from "react";
import { DEMO_PORTFOLIO } from "@/lib/cms/portfolio-demo";

export type PortfolioItemStats = {
  id: string;
  views: number;
  quoteClicks: number;
  shares: number;
};

export type PortfolioDailyPoint = {
  date: string;
  views: number;
  quotes: number;
};

const STORAGE_KEY = "changtee.cms.portfolio-analytics.v1";

type StoreShape = {
  byId: Record<string, PortfolioItemStats>;
  daily: PortfolioDailyPoint[];
};

function seedById(): Record<string, PortfolioItemStats> {
  const seed: Record<string, PortfolioItemStats> = {
    "pf-1": { id: "pf-1", views: 428, quoteClicks: 36, shares: 19 },
    "pf-2": { id: "pf-2", views: 612, quoteClicks: 54, shares: 31 },
    "pf-3": { id: "pf-3", views: 287, quoteClicks: 18, shares: 11 },
    "pf-4": { id: "pf-4", views: 42, quoteClicks: 2, shares: 1 },
  };
  for (const item of DEMO_PORTFOLIO) {
    if (!seed[item.id]) {
      seed[item.id] = { id: item.id, views: 0, quoteClicks: 0, shares: 0 };
    }
  }
  return seed;
}

/** Fixed demo dates so server snapshot stays referentially stable. */
function seedDaily(): PortfolioDailyPoint[] {
  const base = new Date("2026-08-04T12:00:00+07:00");
  const out: PortfolioDailyPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const wave = Math.sin(i / 2.2) * 12 + 38;
    out.push({
      date: key,
      views: Math.round(wave + (i % 3) * 8 + 20),
      quotes: Math.max(1, Math.round(wave / 8 + (i % 4))),
    });
  }
  return out;
}

function createDefaultStore(): StoreShape {
  return { byId: seedById(), daily: seedDaily() };
}

/** Cached for useSyncExternalStore getServerSnapshot — must be stable. */
const SERVER_SNAPSHOT: StoreShape = createDefaultStore();

let memory: StoreShape = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function emit() {
  listeners.forEach((l) => l());
}

function hydrateFromStorage() {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memory = createDefaultStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
      return;
    }
    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed?.byId || !parsed?.daily) {
      memory = createDefaultStore();
      return;
    }
    memory = {
      byId: { ...seedById(), ...parsed.byId },
      daily: parsed.daily.length ? parsed.daily : seedDaily(),
    };
  } catch {
    memory = createDefaultStore();
  }
}

function getSnapshot(): StoreShape {
  hydrateFromStorage();
  return memory;
}

function getServerSnapshot(): StoreShape {
  return SERVER_SNAPSHOT;
}

function write(next: StoreShape) {
  memory = next;
  hydrated = true;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  emit();
}

function bumpDaily(
  store: StoreShape,
  field: "views" | "quotes",
  amount = 1,
): PortfolioDailyPoint[] {
  const key = todayKey();
  const daily = [...store.daily];
  const idx = daily.findIndex((d) => d.date === key);
  if (idx === -1) {
    daily.push({
      date: key,
      views: field === "views" ? amount : 0,
      quotes: field === "quotes" ? amount : 0,
    });
  } else {
    daily[idx] = {
      ...daily[idx],
      [field]: daily[idx][field] + amount,
    };
  }
  daily.sort((a, b) => a.date.localeCompare(b.date));
  while (daily.length > 30) daily.shift();
  return daily;
}

function ensureId(id: string, store: StoreShape): PortfolioItemStats {
  return store.byId[id] ?? { id, views: 0, quoteClicks: 0, shares: 0 };
}

export function trackPortfolioView(id: string) {
  if (!id || typeof window === "undefined") return;
  const store = getSnapshot();
  const cur = ensureId(id, store);
  write({
    byId: { ...store.byId, [id]: { ...cur, views: cur.views + 1 } },
    daily: bumpDaily(store, "views"),
  });
}

export function trackPortfolioQuoteClick(id: string) {
  if (!id || typeof window === "undefined") return;
  const store = getSnapshot();
  const cur = ensureId(id, store);
  write({
    byId: { ...store.byId, [id]: { ...cur, quoteClicks: cur.quoteClicks + 1 } },
    daily: bumpDaily(store, "quotes"),
  });
}

export function trackPortfolioShare(id: string) {
  if (!id || typeof window === "undefined") return;
  const store = getSnapshot();
  const cur = ensureId(id, store);
  write({
    byId: { ...store.byId, [id]: { ...cur, shares: cur.shares + 1 } },
    daily: store.daily,
  });
}

export function getPortfolioStats(id: string): PortfolioItemStats {
  return ensureId(id, getSnapshot());
}

export function listPortfolioStats(): PortfolioItemStats[] {
  return Object.values(getSnapshot().byId);
}

export function getPortfolioDaily(): PortfolioDailyPoint[] {
  return getSnapshot().daily;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePortfolioAnalytics() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function portfolioStatsForItems(
  items: { id: string; title: string; productSlug: string; status: string }[],
  store: StoreShape = getSnapshot(),
) {
  return items.map((item) => {
    const s = store.byId[item.id] ?? {
      id: item.id,
      views: 0,
      quoteClicks: 0,
      shares: 0,
    };
    const conv =
      s.views > 0 ? Math.round((s.quoteClicks / s.views) * 1000) / 10 : 0;
    return { ...item, ...s, conversionRate: conv };
  });
}
