# Security checklist / เช็กลิสต์ความปลอดภัย

## Public site (this pass)

- When Turnstile keys are missing, quote, contact, career, and factory-visit forms are accepted and rely on rate limiting. Verification runs only after both keys are set.
- Turnstile setup: Cloudflare dashboard → Turnstile → Add widget for `changtee-curtain.com` (and `www` if used). Then on the Vercel project set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` for Production and Preview, and redeploy. Local test keys: site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.
- Public CSP on production drops `'unsafe-eval'` and allows `'wasm-unsafe-eval'` so pdf.js can compile WebAssembly. `'unsafe-inline'` stays so pages remain static. `pdfjs-dist` 6 no longer has `isEvalSupported` (the eval image decoder was removed), so the flipbook does not pass that flag. The page-editor CSP is unchanged and still allows `'unsafe-eval'`.
- JSON-LD escapes `<` so CMS text cannot break out of the script tag.
- Public form rate limits call `changtee_web.rate_limit_hit` (one atomic upsert). The client IP is taken from `x-vercel-forwarded-for`, then `x-real-ip`, then `x-forwarded-for`. If the RPC errors, the route falls back to an in-memory counter.
- After every `changtee_web` migration, run `scripts/check-rls.sql` on project `pfwygxzwlteqjnnwiwmb`. It must return zero rows. Bootstrap granted write on every table in the schema to `authenticated`, so a new table without RLS is writable by staff from other apps on the same project.
- Vercel project `changtee-website-2026`: Preview Deployment Protection (Vercel Authentication) is already on (`ssoProtection.deploymentType = preview`). Custom Firewall rules are not available on this project — the WAF API returns `Seawall Config not found` — so the per-IP cap stays in `changtee_web.rate_limit_hit`. If the plan is upgraded, add a Firewall rule: `POST` to `/api/leads`, `/api/leads/upload`, `/api/careers/apply`, `/api/factory-visits`, and `/api/factory-visits/upload`, 20 requests per minute per IP, action deny. `ERROR_WEBHOOK_URL` is still empty in `.env.example`; set it on Vercel to a LINE or Slack incoming webhook when that URL exists.

## Still pending — Admin

Admin login is still off. `isAdminAuthEnforced()` returns `false`, so `/admin` and `/api/admin/*` do not require a session. Do not treat `ADMIN_AUTH_ENFORCED` as live until that function reads the env and production fails closed. The Admin pass (accounts, MFA, role checks, CSRF, session revoke, audit log) is deferred.

## Baseline

- Keep secrets in Vercel or `.env.local`; never commit `.env.local`, SMTP passwords, service-role keys, or admin secrets.
- Guard every admin API with `assertAdminApiAccess` when login is on.
- Use the public `/api/leads` endpoint only for validated lead intake. It rate-limits requests, verifies Turnstile, and accepts only JPEG, PNG, or WebP uploads up to 5 MB after magic-byte checks. Lead photos are stored privately (`leads/` prefix) and opened via signed URLs.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. It bypasses RLS and must never appear in browser code or `NEXT_PUBLIC_*` variables.
- CMS writes go through the service role. `changtee_upsert_site_setting` must not be executable by `anon`.
- Lead photos, CVs, and factory-visit files go in the private `changtee-private` bucket and are opened with signed URLs only.
- Do not grant anonymous direct inserts for leads. The server API owns validation and persistence.
- Review RLS policies whenever a table is exposed through Supabase. Service-role access does not replace RLS for other clients.
- If a secret is committed or shown publicly, rotate it immediately in Supabase, Vercel, and the affected provider.
- Production lead writes must reach Supabase. Local JSON fallback is disabled unless `ALLOW_LOCAL_LEAD_STORE=true` is explicitly set.
