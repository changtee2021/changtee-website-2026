# SEO Final Report — Changtee P0+P1 Implementation

**Date:** 26 Aug 2026  
**Scope:** Documentation + P0/P1 code changes only (per program plan)  
**Domain:** `https://changtee-curtain.com`  
**Verification environment:** Production deployed 26 Aug 2026 → `https://changtee-curtain.com`

---

## Production Deploy (26 Aug 2026)

| Check | Result |
| ----- | ------ |
| PR merged | [#8](https://github.com/changtee2021/changtee-website-2026/pull/8) → `master` |
| Vercel production | `https://changtee-curtain.com` (alias OK) |
| `GET /api/public/health` | `{"ok":true,...}` |
| `GET /sitemap.xml` | HTTP 200 (~157 URLs) |
| Legacy URL 301 | Fixed via **middleware** (next.config Unicode paths returned 404 on Vercel) |
| Thai H1 on `/` | Verified in production HTML |
| OG 1536×1024 | Present on home |
| `SearchAction` in JSON-LD | Absent |
| Vercel hostname → apex | `changtee-website-2026.vercel.app` **308 → changtee-curtain.com** (middleware + next.config) |
| Analytics migration | **Applied** 26 Aug 2026 — `site_page_views` + `analytics_overview()` verified (~195 visitors / 7d) |

**Migrations (site Supabase `pfwygxzwlteqjnnwiwmb`, not shared ERP):**

- ~~`20260825100000_site_page_views.sql`~~ **Done**
- Prior launch migrations if not yet applied: `20260820153000_*`, `20260825040000_*`

**Marketing / Ads:** see [`MARKETING-URL-HANDOFF.md`](MARKETING-URL-HANDOFF.md) — Final URL = `https://changtee-curtain.com/` only.

---

## Owner Actions (NEEDS USER INPUT)

1. ~~Deploy to production~~ **Done** (26 Aug 2026)
2. ~~**Apply analytics migration**~~ **Done** (26 Aug 2026)
3. **Google Search Console** — submit `https://changtee-curtain.com/sitemap.xml`, request removal of legacy URLs, monitor coverage weekly
4. **Google Business Profile** — NAP matches site footer, add photos, collect real reviews (no fake ratings)
5. **Bing Webmaster Tools** — verify site + sitemap
6. **iTop Plus / Google Ads** — Final URL + sitelinks → `https://changtee-curtain.com/...` only ([handoff doc](MARKETING-URL-HANDOFF.md))
7. Confirm **`NEXT_PUBLIC_SITE_URL=https://changtee-curtain.com`** on Vercel production (should already be set)
8. Optional: GA4 / Meta Pixel IDs in Vercel integrations settings

---

## Executive Summary

The SEO program delivered **8 audit/competitive documents** under `docs/seo/` and implemented **all planned P0+P1 fixes** in `changtee-website`. On-site SEO readiness improved from **~68/100 to ~82/100** (estimated; no Search Console access).

Production deploy completed 26 Aug 2026. Owner actions (GSC, GBP, Bing, iTop Plus Final URL) remain for full index consolidation and local/AI visibility.

---

## Score Comparison (Before → After)

| Category | Before | After | Notes |
| -------- | -----: | ----: | ----- |
| **Overall readiness** | 68 | **82** | On-site only |
| Technical SEO | 78 | **86** | Sitemap hardened; preview noindex |
| On-page SEO | 58 | **84** | Thai H1 on hub pages; product title deduped |
| Indexability | 72 | **80** | Legacy 301 configured; GSC cleanup = NEEDS USER INPUT |
| Structured Data | 80 | **88** | SearchAction removed from LocalBusiness graph |
| SMO | 74 | **82** | Default OG width/height 1536×1024 |
| Performance | 70 | **74** | Blog/portfolio ISR (`revalidate = 120`) |
| Content / Trust | 85 / 70 | unchanged | No content or review changes in this round |

---

## P0 — Completed

### 1. Legacy URL 301 redirects

**File:** `next.config.ts`

| Legacy path (evidence: brand SERP Aug 2026) | Destination |
| ------------------------------------------- | ----------- |
| `/หน้าแรก/60ff6a36e68a7c5a4ca8c54e` | `/` |
| `/หน้าแรก/:path*` | `/` |
| `/ผลงาน/610e26deafee180012845be9` | `/portfolio` |
| `/ผลงาน/:path*` | `/portfolio` |
| `/ผ้าม่านไฟฟ้า/68c0e9ae557b0b00135630b4` | `/products/motorized/curtain` |
| `/ผ้าม่านไฟฟ้า/:path*` | `/products/motorized/curtain` |

**Verify after deploy:** `curl -sI https://changtee-curtain.com/หน้าแรก/60ff6a36e68a7c5a4ca8c54e` → `308/301` + `Location: /`

**Local note:** Long-running dev server returned `404` for Thai legacy paths before restart. Redirect rules are in config; confirm on production build.

### 2. Sitemap hardening

**File:** `src/app/sitemap.ts`

- `readCmsCollection` wrapped in `try/catch`
- Falls back to `DEMO_BLOG` / `DEMO_PORTFOLIO` on CMS failure
- **Verified:** `GET /sitemap.xml` → HTTP 200, **157 URLs**

---

## P1 — Completed

### 1. Thai H1 + English eyebrow

| Page | H1 (verified in HTML) | Eyebrow |
| ---- | --------------------- | ------- |
| `/` | แต่งบ้านให้สวย เริ่มที่ผ้าม่านที่ใช่ | Chang Tee · ผลิตเอง ติดตั้งเอง + English subline |
| `/products` | สินค้าและบริการผ้าม่าน | Product & Service · Chang Tee |
| `/blog` | บทความผ้าม่าน | Knowledge · อ่านก่อนตัดสินใจ |
| `/portfolio` | ผลงานติดตั้งผ้าม่าน | Chang Tee Curtain · Install gallery |
| `/learn` | ห้องเรียนรู้ผ้าม่าน | Learning Room · คัมภีร์ช่างตี๋ |
| About hero default | ช่างม่านที่เข้าใจคุณ | เกี่ยวกับเรา · Chang Tee Curtain |

**Files:** `Hero.tsx`, `ProductsHub.tsx`, `BlogIndex.tsx`, `PortfolioIndex.tsx`, `LearnHub.tsx`, `templates.ts`

### 2. Product title — no duplicate brand

**File:** `src/lib/product-presentation.ts`

- **Before:** `ผ้าม่านไฟฟ้า ม่านไฟฟ้า | ช่างตี๋ ผ้าม่าน | ช่างตี๋ ผ้าม่าน` (double brand via template)
- **After:** `ผ้าม่านไฟฟ้า ม่านไฟฟ้า | ช่างตี๋ ผ้าม่าน` ✓

### 3. Preview/staging noindex

**Files:** `src/middleware.ts`, `src/lib/admin-host.ts`

- `isProductionMarketingHost()` → true only for `changtee-curtain.com`
- Non-production public routes get `X-Robots-Tag: noindex, nofollow`
- **Verified on localhost:** `x-robots-tag: noindex, nofollow`

### 4. ISR for blog/portfolio

**Files:** `blog/[slug]/page.tsx`, `portfolio/page.tsx`, `portfolio/[slug]/page.tsx`

- Removed `export const dynamic = "force-dynamic"`
- Added `export const revalidate = 120`

### 5. SearchAction removed

**File:** `src/lib/local-business-jsonld.ts`

- Removed `potentialAction` / `SearchAction` pointing at noindex `/search`
- **Verified:** no `SearchAction` string in home HTML JSON-LD

### 6. OG image dimensions

**Files:** `src/lib/seo/meta.ts`, `src/app/layout.tsx`

- Default image: `public/images/generated/ct-hero-living.webp`
- **Measured:** 1536 × 1024 px
- **Verified in HTML:** `og:image:width=1536`, `og:image:height=1024`

---

## Live HTML Verification (localhost)

| Path | Title | H1 | OG W×H | SearchAction |
| ---- | ----- | -- | ------ | ------------ |
| `/` | ช่างตี๋ ผ้าม่าน \| ออกแบบ-ติดตั้ง… | แต่งบ้านให้สวย… | 1536×1024 | absent ✓ |
| `/products` | สินค้าและบริการ \| ช่างตี๋… | สินค้าและบริการผ้าม่าน | 1536 | absent ✓ |
| `/blog` | บทความ \| ช่างตี๋… | บทความผ้าม่าน | 1536×1024 | absent ✓ |
| `/quote` | ขอใบเสนอราคา \| ช่างตี๋… | ขอใบเสนอราคา | 1536 | absent ✓ |
| `/portfolio` | ผลงานติดตั้ง \| ช่างตี๋… | ผลงานติดตั้งผ้าม่าน | 1536 | absent ✓ |
| `/learn` | ห้องเรียนรู้ \| ช่างตี๋… | ห้องเรียนรู้ผ้าม่าน | 1536 | absent ✓ |
| `/products/motorized/curtain` | ผ้าม่านไฟฟ้า ม่านไฟฟ้า \| ช่างตี๋… (single brand) | ผ้าม่านไฟฟ้า | — | absent ✓ |

**Also verified:**

- `robots.txt` — allows `/`, disallows admin/api
- `sitemap.xml` — HTTP 200, 157 URLs
- Canonical tags present on sampled pages

**Lighthouse:** Not run (Chrome DevTools MCP had no active localhost page). See `WEBSITE-HEALTH.md` for CWV risks; re-run Lighthouse on production after deploy.

---

## Code Quality Checks

| Check | Result |
| ----- | ------ |
| `npm run typecheck` | **Pass** |
| `npm run lint` | **3 pre-existing admin errors** (unrelated to SEO changes): `ApplicationFollowupDialogs.tsx`, `PageEditorShell.tsx`, `useAdminInboxBadges.ts` |
| `npm run build` | Not run (hold rule — run before deploy) |

---

## Documentation Delivered

| File | Status |
| ---- | ------ |
| `docs/seo/SEO-AUDIT.md` | ✓ |
| `docs/seo/WEBSITE-HEALTH.md` | ✓ |
| `docs/seo/SEO-IMPLEMENTATION-PLAN.md` | ✓ |
| `docs/seo/COMPETITOR-SEO-GAP.md` | ✓ |
| `docs/seo/AI-SEARCH-COMPETITIVE-ANALYSIS.md` | ✓ |
| `docs/seo/SEARCH-TREND-RADAR.md` | ✓ |
| `docs/seo/COMPETITIVE-SEO-ROADMAP.md` | ✓ |
| `docs/seo/SEO-FINAL-REPORT.md` | ✓ (this file) |
| `docs/seo/MARKETING-URL-HANDOFF.md` | ✓ |
| `docs/README.md` | ✓ linked SEO section |

---

## Owner checklist (copy to ops)

- [x] Run migration `20260825100000_site_page_views.sql` on production Supabase
- [ ] iTop Plus: Final URL `https://changtee-curtain.com/` + sitelinks per [`MARKETING-URL-HANDOFF.md`](MARKETING-URL-HANDOFF.md)
- [ ] GSC: add property `changtee-curtain.com`, submit sitemap, inspect legacy URL coverage
- [ ] GSC: URL removal or wait for 301 + recrawl on `/หน้าแรก/*`, `/ผลงาน/*`, `/ผ้าม่านไฟฟ้า/*`
- [ ] GBP: verify phone/address/hours vs `/contact`
- [ ] Bing Webmaster: verify + sitemap
- [ ] After 2 weeks: compare brand SERP vs baseline in `SEO-AUDIT.md`

---

## Recommended Next Steps (P2+, out of scope)

- New comparison/how-to articles (competitor gap matrix in `COMPETITOR-SEO-GAP.md`)
- GBP + review program (roadmap Phase 2)
- GSC-driven legacy URL de-index monitoring after 301 deploy
- Lighthouse/CWV pass on production `/` and `/quote`

---

## Files Changed (code)

```
next.config.ts
src/app/layout.tsx
src/app/sitemap.ts
src/app/(site)/blog/[slug]/page.tsx
src/app/(site)/portfolio/page.tsx
src/app/(site)/portfolio/[slug]/page.tsx
src/components/home/Hero.tsx
src/components/products/ProductsHub.tsx
src/components/blog/BlogIndex.tsx
src/components/portfolio/PortfolioIndex.tsx
src/components/learn/LearnHub.tsx
src/lib/cms/page-sections/templates.ts
src/lib/product-presentation.ts
src/lib/local-business-jsonld.ts
src/lib/seo/meta.ts
src/lib/admin-host.ts
src/middleware.ts
```

**Shipped:** PR #8 merged; production deploy 26 Aug 2026.
