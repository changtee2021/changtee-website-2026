# Lead operations / การดูแล lead

## Flow / ขั้นตอน

1. A visitor submits the quote, estimate, contact, or FAB form.
2. The browser sends a validated request to `POST /api/leads`.
3. The server stores the lead in `changtee_web.leads` and records its initial event.
4. When configured, the server sends email or LINE notifications.
5. Admin users view and update lead status through the guarded admin APIs.

## Fallback / ระบบสำรอง

`.data/leads.json` is a local-development fallback only. Production must persist to Supabase; failures return a temporary-unavailable response instead of silently writing to local disk.

Check Supabase credentials, database availability, and notification credentials when lead intake fails. Do not enable local fallback on Vercel as a general fix.
