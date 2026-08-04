# Supabase / ฐานข้อมูล

The website uses a dedicated Supabase project, not the shared ERP.

| Item | Value |
|---|---|
| Project name | wp-enterprise |
| Project ref | `pfwygxzwlteqjnnwiwmb` |
| URL | `https://pfwygxzwlteqjnnwiwmb.supabase.co` |
| App schema | `changtee_web` |
| Dashboard | https://supabase.com/dashboard/project/pfwygxzwlteqjnnwiwmb |

## CLI / คำสั่ง local

```bash
npx supabase login
npx supabase link --project-ref pfwygxzwlteqjnnwiwmb
npx supabase db push
```

Migrations live in `supabase/migrations/`.

## Dashboard checklist

1. In **Settings → API → Exposed schemas**, add `changtee_web` (keep `public`).
2. Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the legacy anon JWT, or use the modern publishable key when configured.
3. Set `SUPABASE_SERVICE_ROLE_KEY` only on the server. Never expose or commit it.

The lead API uses the service role and bypasses RLS. Without it, local development may use `.data/leads.json`; production rejects that fallback by default.
