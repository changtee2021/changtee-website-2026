import type { PortfolioItem } from "@/lib/cms/portfolio-demo";
import { productLabel } from "@/lib/cms/portfolio-demo";

/** A page with fewer published jobs would be too thin to index. */
export const MIN_AREA_JOBS = 3;

const BANGKOK = new Set(["กรุงเทพฯ", "กรุงเทพ", "กรุงเทพมหานคร", "กทม", "กทม."]);

/**
 * Neighbourhood when the place ends in Bangkok, otherwise the province.
 * "อ่อนนุช กรุงเทพฯ" → อ่อนนุช, "พระราม 5 นนทบุรี" → นนทบุรี.
 */
export function areaName(place: string): string | null {
  const parts = place.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  const last = parts[parts.length - 1]!;
  if (BANGKOK.has(last) && parts.length >= 2) return parts[parts.length - 2]!;
  return last;
}

export function areaPath(name: string): string {
  return `/areas/${encodeURIComponent(name)}`;
}

export type ServiceArea = {
  name: string;
  items: PortfolioItem[];
};

export function serviceAreaNames(
  items: { status?: string; place?: string }[],
): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.status !== "published") continue;
    const name = areaName(item.place ?? "");
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= MIN_AREA_JOBS)
    .map(([name]) => name);
}

/** Areas with enough published jobs to deserve their own page, busiest first. */
export function serviceAreas(items: PortfolioItem[]): ServiceArea[] {
  const map = new Map<string, PortfolioItem[]>();
  for (const item of items) {
    if (item.status !== "published") continue;
    const name = areaName(item.place);
    if (!name) continue;
    const list = map.get(name) ?? [];
    list.push(item);
    map.set(name, list);
  }
  return [...map.entries()]
    .filter(([, list]) => list.length >= MIN_AREA_JOBS)
    .map(([name, list]) => ({
      name,
      items: list.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "th")),
    }))
    .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name, "th"));
}

export function serviceAreaByName(items: PortfolioItem[], name: string): ServiceArea | undefined {
  return serviceAreas(items).find((area) => area.name === name);
}

export function areaJobLine(item: PortfolioItem): string {
  const product = productLabel(item.productSlug);
  const place = item.place.trim();
  return [product, place].filter(Boolean).join(" · ");
}
