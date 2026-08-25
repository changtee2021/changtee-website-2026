# Security checklist / เช็กลิสต์ความปลอดภัย

- Keep secrets in Vercel or `.env.local`; never commit `.env.local`, SMTP passwords, service-role keys, or admin secrets.
- Guard every admin API with `assertAdminApiAccess` when login is on. Login is parked (`ADMIN_AUTH_ENFORCED` unset) until the team turns it on.
- Use the public `/api/leads` endpoint only for validated lead intake. It rate-limits requests (Supabase-backed when configured), verifies Turnstile when both keys are set, and accepts only JPEG, PNG, or WebP uploads up to 5 MB after magic-byte checks. Lead photos are stored privately (`leads/` prefix) and opened via signed URLs.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. It bypasses RLS and must never appear in browser code or `NEXT_PUBLIC_*` variables.
- Production requires `ADMIN_AUTH_ENFORCED=true`. Other controls (Turnstile, private uploads, CMS service-role writes) stay on.
- CMS writes go through the service role. `changtee_upsert_site_setting` must not be executable by `anon`.
- Lead photos, CVs, and factory-visit files go in the private `changtee-private` bucket and are opened with signed URLs only.
- Do not grant anonymous direct inserts for leads. The server API owns validation and persistence.
- Review RLS policies whenever a table is exposed through Supabase. Service-role access does not replace RLS for other clients.
- If a secret is committed or shown publicly, rotate it immediately in Supabase, Vercel, and the affected provider.
- Production lead writes must reach Supabase. Local JSON fallback is disabled unless `ALLOW_LOCAL_LEAD_STORE=true` is explicitly set.
