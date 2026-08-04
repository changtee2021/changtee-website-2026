# Deployment / การขึ้นระบบ

Deploy previews to Vercel as `*.vercel.app`. The public site and admin share the same Vercel project; use `/admin` on local and preview deployments.

## Required environment variables

Set production values in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or publishable key
- `NEXT_PUBLIC_SUPABASE_SCHEMA=changtee_web`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SESSION_SECRET`
- `DEMO_ADMIN_PASSWORD` only if the temporary bootstrap login is intentionally used
- SMTP and LINE variables when notifications are enabled

Never set `ALLOW_OPEN_ADMIN_API=true` in production. Do not enable `ALLOW_LOCAL_LEAD_STORE` on Vercel unless accepting non-durable fallback is an explicit operational decision.

## Domains / โดเมน

Use Vercel previews until the production domain is ready. Add the site domain and, later, the admin domain to this same project. Configure `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ADMIN_URL` when domains are final.

## Files / ไฟล์ขนาดใหญ่

Large PDFs are gitignored. Store them outside Git or use approved object storage; do not force-add binary source files to the repository.
