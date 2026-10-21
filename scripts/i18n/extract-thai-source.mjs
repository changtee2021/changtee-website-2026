/**
 * Collect Thai source strings for the Thai-keyed content packs
 * (`src/lib/i18n/content/thai-text/*.ts`).
 *
 * Reads static data files + the live public CMS API, merges `extra-source.json`,
 * and writes `scripts/i18n/source.json` as [{ id, th }].
 *
 *   SCAN_BASE=http://localhost:3001 node scripts/i18n/extract-thai-source.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BASE = process.env.SCAN_BASE ?? "http://localhost:3000";
const THAI = /[\u0E00-\u0E7F]/;

const out = new Set();
const add = (s) => {
  if (typeof s !== "string") return;
  const t = s.replace(/\s+/g, " ").trim();
  if (t && THAI.test(t)) out.add(t);
};

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

/** Double-quoted string values for the given property names. */
function fieldLiterals(src, fields) {
  const re = new RegExp(
    `\\b(?:${fields.join("|")})\\s*:\\s*("(?:[^"\\\\]|\\\\.)*")`,
    "g",
  );
  for (const m of src.matchAll(re)) {
    try {
      add(JSON.parse(m[1]));
    } catch {
      /* skip non-JSON-safe literal */
    }
  }
}

/** Every double-quoted Thai literal in a slice of a file. */
function allLiterals(src) {
  for (const m of src.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
    try {
      add(JSON.parse(`"${m[1]}"`));
    } catch {
      /* ignore */
    }
  }
}

// Homepage CMS defaults (values only, not admin field labels).
{
  const src = read("src/lib/cms/page-sections.ts");
  const start = src.indexOf("export const HOME_SECTION_DEFAULTS");
  const end = src.indexOf("export const PRODUCT_PAGE_KEY");
  allLiterals(src.slice(start, end));
}

fieldLiterals(read("src/lib/cms/hero-slides-demo.ts"), ["alt", "subtitle", "price", "badge"]);
fieldLiterals(read("src/lib/cms/reviews-demo.ts"), ["displayName", "body", "productHint"]);
fieldLiterals(read("src/lib/cms/blog-demo.ts"), ["title", "excerpt"]);
fieldLiterals(read("src/lib/catalogs.ts"), ["title", "description"]);

// Install-video clip titles.
{
  const src = read("src/lib/product-decision-aids.ts");
  const start = src.indexOf("const FEATURED_INSTALL_VIDEOS");
  const end = src.indexOf("export", start);
  fieldLiterals(src.slice(start, end > start ? end : undefined), ["title"]);
}

// Page <title> / description literals passed to pageMetadata().
{
  const pages = [
    "about", "blog", "careers", "contact", "cookies", "learn", "privacy",
    "products", "quote", "search", "terms", "unsubscribe", "portfolio",
    "visit-factory", "thank-you",
  ];
  for (const p of pages) {
    const file = `src/app/[lang]/${p}/page.tsx`;
    if (existsSync(join(ROOT, file))) {
      fieldLiterals(read(file), ["title", "description"]);
    }
  }
}

// Live CMS collections (portfolio + page-sections are DB-backed).
async function cms(collection) {
  try {
    const res = await fetch(`${BASE}/api/public/cms/${collection}`, {
      signal: AbortSignal.timeout(120_000),
    });
    const json = await res.json();
    return Array.isArray(json.items) ? json.items : [];
  } catch (err) {
    console.error(`cms ${collection}: ${err}`);
    return [];
  }
}

for (const item of await cms("portfolio")) {
  add(item.title);
  add(item.summary);
  add(item.place);
  for (const tag of item.tags ?? []) add(tag);
}
for (const rec of await cms("page-sections")) {
  if (rec.pageKey && rec.pageKey !== "home") continue;
  for (const v of Object.values(rec.values ?? {})) add(v);
}

const extraPath = join(ROOT, "scripts/i18n/extra-source.json");
if (existsSync(extraPath)) {
  for (const s of JSON.parse(readFileSync(extraPath, "utf8"))) add(s);
}

const list = [...out].map((th, i) => ({ id: `s${i}`, th }));
writeFileSync(
  join(ROOT, "scripts/i18n/source.json"),
  JSON.stringify(list, null, 2) + "\n",
);
console.log(`source strings: ${list.length}`);
