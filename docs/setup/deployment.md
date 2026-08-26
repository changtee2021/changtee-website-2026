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

Production site: `https://changtee-curtain.com`. Admin stays on the same host at `/admin` (do not set `NEXT_PUBLIC_ADMIN_URL` until you intentionally add `admin.changtee-curtain.com`). Set `NEXT_PUBLIC_SITE_URL=https://changtee-curtain.com`.

The Vercel hostname `changtee-website-2026.vercel.app` **301-redirects** to `changtee-curtain.com` — do not use it in ads or GSC. See [Marketing URL handoff](../seo/MARKETING-URL-HANDOFF.md).

Set `ADMIN_AUTH_ENFORCED=true` and `DEMO_ADMIN_PASSWORD` on production. Never set `ALLOW_OPEN_ADMIN_API=true` on Vercel.

## Files / ไฟล์ขนาดใหญ่

Large PDFs are gitignored. Store them outside Git or use approved object storage; do not force-add binary source files to the repository.
