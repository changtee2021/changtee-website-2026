# Website Health — changtee-website

**Audit date:** 26 Aug 2026  
**Stack:** Next.js 16.3 · React 19.2 · Tailwind 4 · Supabase `changtee_web`

---

## Overall Health Score: 74 / 100

| Dimension | Score | Notes |
| --------- | ----: | ----- |
| Performance | 70 | WebP heroes; framer-motion on home; ~120 `"use client"` files |
| Code Quality | 78 | Typed CMS layer; consistent `pageMetadata()` |
| Reliability | 72 | Sitemap CMS dependency; demo-store hydration |
| Security | 82 | CSP, HSTS, admin session, Turnstile on forms |
| Accessibility | 76 | Skip link, Thai lang; touch targets mostly ≥44px on CTAs |
| UX | 80 | Clear quote flow; mobile dock |
| SEO | 68 → 82 (post P0+P1) | See SEO-AUDIT.md |

---

## Architecture

- **Rendering:** Hybrid — server metadata/JSON-LD + client hubs (blog/portfolio/products index) via `demo-store` fetching `/api/public/cms/*`
- **Data:** Supabase CMS collections with demo seed fallback
- **Images:** `next/image` + WebP assets; remote Supabase + YouTube thumbs
- **Fonts:** IBM Plex Sans Thai, Bai Jamjuree, Outfit (Google, subsetted)

---

## Core Web Vitals (code-level risks)

### LCP

| Element | Page | Risk | Mitigation |
| ------- | ---- | ---- | ---------- |
| Hero image | `/` | Medium | `priority` on first slide ✓; full-viewport hero |
| PageHero image | `/products`, `/blog`, etc. | Medium | Server-rendered img via PageHero |
| Product hero | `/products/*/*` | Low | priority on detail |

### CLS

- `next/image` with fill + aspect containers on most cards ✓
- Font variables on `<html>` ✓
- Cookie banner bottom — minor shift acceptable

### INP

- Portfolio filter UI, blog expand, framer-motion hero — watch on mid-tier Android
- No change in P0/P1 scope beyond ISR (reduces server wait)

---

## JavaScript

- **~120 client components** — hubs intentionally client for CMS live preview parity
- **Heavy deps:** framer-motion, recharts (admin), pdfjs (catalog modal)
- **Third-party (after consent):** GTM `GTM-5JX8PGT`, optional GA4/Pixel

---

## Network & Caching

- Public pages: `Cache-Control: public, max-age=0, must-revalidate` (Vercel default)
- Blog/portfolio detail: moving to `revalidate: 120` (P1)
- Videos: `max-age=31536000, immutable`

---

## Performance Budget (recommended)

| Resource | Target |
| -------- | ------ |
| LCP | < 2.5s mobile (4G) |
| INP | < 200ms |
| CLS | < 0.1 |
| Initial JS (public home) | < 200 KB gzip (stretch goal) |
| Default OG image | < 100 KB (current ~67 KB ✓) |

---

## Top Problems (ranked)

1. **Client-rendered hub H1/content** — crawlers see SSR shell then hydrate (acceptable but not ideal)
2. **CMS-dependent sitemap** — fixed with fallback (P0) + ISR/timeout after an intermittent 500 on 26 Aug (see SEO-FINAL-REPORT.md)
3. **Preview deployment index leak** — fixed with middleware noindex (P1)
4. **Legacy URL equity split** — fixed with 301 table (P0)

---

## Quick Wins (this program)

- Sitemap hardening
- Legacy redirects
- Thai H1
- ISR on blog/portfolio
- OG dimensions

---

## Technical Debt (not in P0/P1)

- Migrate hub pages to server components with initial CMS fetch
- Learn pages JSON-LD
- Lighthouse CI on PRs
- Reduce framer-motion on LCP hero for reduced-motion users (partial ✓)

---

## Build Health

Run before ship:

```bash
npm run lint
npm run typecheck
npm run build   # before production deploy only
```

---

## Security Notes

- No secrets in client bundles (Supabase service role server-only ✓)
- Admin routes protected by session middleware
- `.env` not committed
