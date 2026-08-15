# Architecture overview / ภาพรวมโครงสร้าง

The app is one Next.js project with three surfaces:

- **Site** — public pages under `src/app`, including products, blog, quote, `/learn` (shop knowledge bible), and `/contact` (about; same layout as `/about`).
- **Admin** — `/admin` pages and `src/components/admin`; it is not linked from the public header.
- **API** — route handlers under `src/app/api`, including public lead intake and guarded admin lead APIs.

## Key folders

- `src/lib` — shared domain code: validation, CMS demo data, lead persistence, Supabase clients, and estimator engine.
- `src/components` — site and admin UI components.
- `src/app` — App Router pages, layouts, and API handlers.
- `supabase/migrations` — schema changes for the dedicated Supabase project.

Keep public mock mappings dependent on CMS demo data, never the reverse, to avoid circular imports.
