# Page Editor architecture

Visual CMS for marketing pages: left sitemap tree, center live preview, right inspector.

## Layers (import one-way only)

1. **Primitive** — `lib/editor/protocol.ts` (types/const only), preview token, supabase helpers  
2. **Data** — `lib/cms/*` collections + server read/write  
3. **Feature** — `lib/editor/*` registry, draft store, publish  
4. **UI** — `app/admin/editor/*`, `components/admin/editor/*`, `components/preview/*`

## Security rules

- Public API (`/api/public/cms/*`) only serves `PUBLIC_CMS_COLLECTIONS`  
- Draft / history keys (`page-sections-draft`, `page-sections-history`) are admin-only  
- Preview iframe uses signed `?__preview=` token (HMAC, 30 min, bound to employee code)  
- Preview writes use `applyPreviewPageSections()` — memory only, never Supabase  
- Middleware overrides CSP `frame-ancestors` for valid preview tokens  

## Routes

- Editor UI: `/admin/editor/home`, `/admin/editor/products/detail`, …  
- Preview token: `POST /api/admin/cms/preview-token`  
- Draft: `GET|PUT /api/admin/cms/draft`  
- Publish: `POST /api/admin/cms/publish`  
- Flag: `NEXT_PUBLIC_PAGE_EDITOR_ENABLED` (default on)

## Add a new editable page

1. Add section defs/defaults in `lib/cms/page-sections/` (or `page-sections/templates.ts`)  
2. Register a node in `lib/editor/page-registry.ts` (`pageKey`, `defs`, `livePath`, `kind`)  
3. Wrap editable spots on the **live** page with `components/preview/EditableSpot`  
4. Set `status: "editable"` and `revalidate` paths  
5. No editor UI changes required

## Template vs single

- `kind: "single"` — one URL (home, about, contact)  
- `kind: "template"` — one section set shared by many URLs (product detail, blog post, portfolio item)  
  Preview uses a variant picker; publish affects every matching page.

## Currently editable

| pageKey | kind | Live spots |
|---------|------|------------|
| `home` | single | Home sections |
| `product` | template | Product detail CMS blocks |
| `about` | single | Hero + ONE STOP |
| `contact` | single | Header title/subtitle |
| `blogPost` | template | CTA + related headings |
| `portfolioItem` | template | CTA + related heading |
