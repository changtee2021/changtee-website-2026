import { blogIndexableLocales } from "@/lib/i18n/content/thai-text/sections.server";
import { areaPath, serviceAreaNames } from "@/lib/service-areas";
import { siteConfig } from "@/lib/site-config";

/**
 * Public IndexNow key. It is not a secret: Bing fetches it from /indexnow.txt
 * to prove we own the host. https://www.indexnow.org/documentation
 */
export const INDEXNOW_KEY = "ct7f3a9c2e1b84d06a5e91c4b8f0d2a6";

type CmsItem = {
  slug?: string;
  status?: string;
  place?: string;
};

function asCmsItems(items: unknown[]): CmsItem[] {
  return items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return [
      {
        slug: typeof row.slug === "string" ? row.slug : undefined,
        status: typeof row.status === "string" ? row.status : undefined,
        place: typeof row.place === "string" ? row.place : undefined,
      },
    ];
  });
}

/** URLs worth telling Bing about after a CMS save. */
export function indexNowPaths(collection: string, items: unknown[]): string[] {
  const paths = new Set<string>(["/llms.txt", "/llms-full.txt", "/sitemap.xml"]);
  const published = asCmsItems(items).filter((item) => item.status === "published" && item.slug);

  if (collection === "blog") {
    paths.add("/blog");
    for (const item of published) {
      if (!item.slug) continue;
      for (const locale of blogIndexableLocales(item.slug)) {
        paths.add(locale === "en" ? `/en/blog/${item.slug}` : `/blog/${item.slug}`);
      }
    }
  } else if (collection === "portfolio") {
    paths.add("/portfolio");
    paths.add("/areas");
    for (const item of published) paths.add(`/portfolio/${item.slug}`);
    for (const name of serviceAreaNames(asCmsItems(items))) paths.add(areaPath(name));
  } else {
    paths.add("/");
  }
  return [...paths];
}

/** Tell Bing (and every IndexNow engine) that these URLs changed. Never throws. */
export async function pingIndexNow(paths: string[]): Promise<void> {
  const base = siteConfig.url.replace(/\/$/, "");
  let host = "";
  try {
    host = new URL(base).host;
  } catch {
    return;
  }
  if (!host || host === "localhost" || host.startsWith("127.")) return;

  const urlList = [...new Set(paths)]
    .filter((path) => path.startsWith("/") && !path.includes("["))
    .slice(0, 1000)
    .map((path) => `${base}${path}`);
  if (urlList.length === 0) return;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${base}/indexnow.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) console.error("indexnow ping failed", res.status);
  } catch (err) {
    console.error("indexnow ping failed", err);
  }
}
