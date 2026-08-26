# SEO Audit — ช่างตี๋ ผ้าม่าน (changtee-website)

**Production domain:** `https://changtee-curtain.com`  
**Audit date:** 26 Aug 2026  
**Repository:** `changtee-website` (Next.js 16.3, React 19.2, App Router)

---

## Executive Summary

The site has a **solid technical SEO foundation** (robots, sitemap, canonical, JSON-LD, GSC verification, Thai `lang`, consent-aware analytics). Content depth (**~50 blog posts, 42 portfolio items, 50 product URLs, `/learn` sheets**) exceeds most direct local competitors.

The largest gaps before this program were:

1. **English H1 on money pages** while Thai customers search in Thai.
2. **Legacy URLs still visible in brand SERP** (old CMS paths with Mongo-style IDs).
3. **Duplicate brand in product `<title>`** (template + inline `seoTitle`).
4. **Preview/staging hosts indexable** alongside production canonicals.
5. **Sitemap fragility** when CMS RPC fails (intermittent 500).
6. **Off-site entity signals** (GBP, reviews, Bing) — owner action required.

**Overall SEO readiness (pre-fix):** ~68/100  
**Target after P0+P1:** ~82/100 (on-site); off-site work needed for 90+.

---

## Category Scores (0–100)

| Category | Score | Rationale |
| -------- | ----: | --------- |
| Technical SEO | 78 | robots/sitemap/canonical/HSTS/CSP present; sitemap CMS failure risk; preview host leak |
| On-page SEO | 58 | Good Thai titles/descriptions; English H1 on hub pages; product title duplication |
| Indexability | 72 | 157 URLs in sitemap; legacy URLs indexed; `/search` correctly noindex |
| Structured Data | 80 | LocalBusiness, Article, Product+FAQ, Breadcrumb; SearchAction pointed at noindex `/search` |
| SMO | 74 | OG/Twitter on all pages; default OG image lacked width/height metadata |
| GEO/AEO | 65 | Strong blog + learn content; weak GBP/review citations in AI answers (external) |
| Performance | 70 | Hero WebP, font subsetting; heavy client components on hubs; `force-dynamic` on blog/portfolio |
| Accessibility | 76 | Skip link, semantic landmarks; some icon-only controls need ongoing review |
| Internal Linking | 82 | Nav + product/blog/portfolio cross-links; quote CTA on product pages |
| Content | 85 | 50 articles with unique seoTitle; product FAQs; portfolio evidence |
| Trust / E-E-A-T | 70 | Legal entity, address, privacy/terms; no fake reviews; GBP depth = NEEDS USER INPUT |

---

## Indexing Strategy

### Index (allow)

| Area | Paths |
| ---- | ----- |
| Home & conversion | `/`, `/quote`, `/visit-factory` |
| Products | `/products`, `/products/:category`, `/products/:category/:slug` |
| Content | `/blog`, `/blog/:slug`, `/learn`, `/learn/:slug` |
| Proof | `/portfolio`, `/portfolio/:slug` |
| Trust | `/contact`, `/careers`, legal pages |

### Noindex (block)

| Area | Mechanism |
| ---- | --------- |
| Admin | `/admin/*` — middleware `X-Robots-Tag` + robots disallow |
| API / leads | `/api`, `/leads` — robots disallow |
| Search | `/search` — `robots: noindex, follow` |
| Preview token | `?preview=` — middleware noindex |
| Non-production hosts | Preview Vercel URLs — middleware noindex (P1) |
| Utility | `/thank-you`, `/unsubscribe`, error pages |

### Canonical

- Per-page via `pageMetadata()` → `alternates.canonical`
- Root layout sets `metadataBase` from `NEXT_PUBLIC_SITE_URL` (must be production on Vercel)

---

## Issue Table

| Priority | Area | Issue | URL/File | Impact | Recommendation | Effort |
| -------- | ---- | ----- | -------- | ------ | -------------- | ------ |
| P0 | Indexing | Legacy CMS URLs in Google (e.g. `/หน้าแรก/:id`) | `next.config.ts` | Split signals, wrong landing | 301 to new routes | S |
| P0 | Technical | Sitemap 500 when CMS RPC fails | `src/app/sitemap.ts` | Crawl failure | try/catch + demo fallback | S |
| P1 | On-page | English H1 on hub pages | Hero, ProductsHub, BlogIndex, etc. | Thai query mismatch | Thai H1 + EN eyebrow | S |
| P1 | Metadata | Product title duplicates brand | `product-presentation.ts` | Truncation, spam signal | Remove brand from seoTitle | S |
| P1 | Indexing | Preview host indexable | `middleware.ts` | Duplicate content | noindex non-prod host | S |
| P1 | Crawl | blog/portfolio `force-dynamic` | blog/portfolio pages | Slow crawl | ISR revalidate 120s | S |
| P1 | Schema | SearchAction → noindex `/search` | `local-business-jsonld.ts` | Invalid rich-result hint | Remove SearchAction | S |
| P1 | SMO | OG image missing dimensions | `meta.ts` | Social crop issues | width/height 1536×1024 | S |
| P2 | Entity | GBP completeness & reviews | External | Local + AI visibility | Owner: GBP + review flow | M |
| P2 | Content | Comparison pages vs HomePro/Infinity | `/blog` gaps | Mid-funnel traffic | Enhance existing articles, not clones | M |
| P2 | Performance | Client-heavy hub pages | `demo-store.ts` hubs | INP/LCP | Incremental RSC later | L |
| P3 | SMO | Per-page unique OG beyond product/blog | Various | Share CTR | CMS OG overrides | M |
| P3 | GEO | Original price/install data page | New page | AI citation moat | Owner-approved stats only | L |

---

## Route Map (public marketing)

| Route | Index | Notes |
| ----- | ----- | ----- |
| `/` | yes | LocalBusiness JSON-LD |
| `/products/**` | yes | Product+FAQ JSON-LD on detail |
| `/blog/**` | yes | Article JSON-LD |
| `/portfolio/**` | yes | CreativeWork JSON-LD |
| `/learn/**` | yes | No JSON-LD yet (P3 candidate: Article) |
| `/quote` | yes | Conversion |
| `/contact` | yes | About content (redirect from `/about`) |
| `/search` | no | Site search utility |
| `/admin/**` | no | Staff only |

---

## NEEDS USER INPUT

- Google Search Console coverage & URL removal for legacy paths
- Google Business Profile verification and review velocity
- Bing Webmaster Tools
- `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` on Vercel (optional)
- Whether to publish first-party pricing/install statistics as citable data
