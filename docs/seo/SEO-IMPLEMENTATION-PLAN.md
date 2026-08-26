# SEO Implementation Plan — changtee-website

Phased execution for P0/P1 fixes. P2+ deferred to COMPETITIVE-SEO-ROADMAP.md.

---

## Phase 1 — Critical Technical Fixes (P0)

### 1.1 Legacy URL redirects

| | |
| --- | --- |
| **What** | 301 old CMS Thai paths to new App Router URLs |
| **Why** | Brand SERP still shows `/หน้าแรก/:id`, `/ผลงาน/:id`, `/ผ้าม่านไฟฟ้า/:id` |
| **Files** | `next.config.ts` |
| **Evidence** | Google results Aug 2026 for changtee-curtain.com legacy paths |
| **Redirects** | `/หน้าแรก/:path*` → `/` · `/ผลงาน/:path*` → `/portfolio` · `/ผ้าม่านไฟฟ้า/:path*` → `/products/motorized/curtain` · specific IDs as permanent 301 |
| **Verify** | `curl -I` legacy URL → 308/301 to target |
| **Effort** | S |

### 1.2 Sitemap hardening

| | |
| --- | --- |
| **What** | Wrap CMS reads in try/catch; fallback to demo published content |
| **Why** | Intermittent sitemap 500 breaks crawl |
| **Files** | `src/app/sitemap.ts` |
| **Verify** | GET `/sitemap.xml` → 200, ≥150 URLs |
| **Effort** | S |

---

## Phase 2 — Indexing & Metadata (P1)

### 2.1 Non-production host noindex

| | |
| --- | --- |
| **What** | `X-Robots-Tag: noindex, nofollow` when host ≠ `changtee-curtain.com` (public routes) |
| **Why** | Preview Vercel URLs share production canonical |
| **Files** | `src/middleware.ts`, `src/lib/admin-host.ts` |
| **Verify** | `curl -I https://changtee-website-2026.vercel.app/` shows noindex |
| **Effort** | S |

### 2.2 Thai H1 on hub pages

| | |
| --- | --- |
| **What** | Thai `<h1>`; English moves to eyebrow/subtitle |
| **Why** | Thai search intent alignment |
| **Files** | `Hero.tsx`, `ProductsHub.tsx`, `BlogIndex.tsx`, `PortfolioIndex.tsx`, `LearnHub.tsx`, `page-sections/templates.ts` |
| **Verify** | Live HTML H1 in Thai on `/`, `/products`, `/blog`, `/portfolio`, `/learn`, `/contact` |
| **Effort** | S |

### 2.3 Product title deduplication

| | |
| --- | --- |
| **What** | `seoTitle` = `{product} {category}` without `\| ช่างตี๋` (layout template adds brand) |
| **Files** | `src/lib/product-presentation.ts` |
| **Verify** | Product page title has brand once |
| **Effort** | S |

---

## Phase 3 — Structured Data (P1)

### 3.1 Remove SearchAction

| | |
| --- | --- |
| **What** | Drop `potentialAction` SearchAction from WebSite node |
| **Why** | `/search` is noindex |
| **Files** | `src/lib/local-business-jsonld.ts` |
| **Verify** | Homepage JSON-LD has no SearchAction |
| **Effort** | S |

---

## Phase 4 — Performance / Crawl (P1)

### 4.1 ISR for blog & portfolio

| | |
| --- | --- |
| **What** | Replace `force-dynamic` with `revalidate = 120` on blog detail, portfolio detail, portfolio index |
| **Files** | `src/app/(site)/blog/[slug]/page.tsx`, `portfolio/page.tsx`, `portfolio/[slug]/page.tsx` |
| **Verify** | Build does not force fully dynamic; pages still show CMS content |
| **Effort** | S |

---

## Phase 5 — SMO (P1)

### 5.1 OG image dimensions

| | |
| --- | --- |
| **What** | Add width/height for default OG image (1536×1024 measured) |
| **Files** | `src/lib/seo/meta.ts`, `src/app/layout.tsx` |
| **Verify** | OG tags include dimensions on home |
| **Effort** | S |

---

## Dependencies

- Production `NEXT_PUBLIC_SITE_URL=https://changtee-curtain.com` on Vercel
- CMS RPC available for fresh content (fallback covers outage)

---

## Out of scope (this sprint)

- New blog posts
- GBP / GSC (owner)
- Learn page JSON-LD
- Hub RSC migration

---

## Validation checklist

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] Live: title, H1, canonical, robots, sitemap, JSON-LD
- [ ] `SEO-FINAL-REPORT.md` updated
