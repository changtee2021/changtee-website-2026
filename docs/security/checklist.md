# Security checklist / เช็กลิสต์ความปลอดภัย

- Keep secrets in Vercel or `.env.local`; never commit `.env.local`, SMTP passwords, service-role keys, or admin secrets.
- Guard every admin API with `assertAdminApiAccess`. Production requires the admin cookie or `x-admin-dev-key`; `ALLOW_OPEN_ADMIN_API=true` is local-only.
- Use the public `/api/leads` endpoint only for validated lead intake. It rate-limits requests and accepts only JPEG, PNG, or WebP uploads up to 5 MB.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. It bypasses RLS and must never appear in browser code or `NEXT_PUBLIC_*` variables.
- Do not grant anonymous direct inserts for leads. The server API owns validation and persistence.
- Review RLS policies whenever a table is exposed through Supabase. Service-role access does not replace RLS for other clients.
- If a secret is committed or shown publicly, rotate it immediately in Supabase, Vercel, and the affected provider.
- Production lead writes must reach Supabase. Local JSON fallback is disabled unless `ALLOW_LOCAL_LEAD_STORE=true` is explicitly set.
