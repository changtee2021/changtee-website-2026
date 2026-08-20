# Admin security checklist

## Required Vercel Production env

| Variable | Purpose |
|---|---|
| `ADMIN_SESSION_SECRET` | HMAC key for signed admin cookies (32+ random bytes hex) |
| `DEMO_ADMIN_PASSWORD` | Password for bootstrap employee `000000` |

Optional / local only:

| Variable | Notes |
|---|---|
| `ADMIN_AUTH_ENFORCED=true` | Turn admin login back on (off by default until the team is ready). |
| `ALLOW_OPEN_ADMIN_API=true` | Opens admin APIs without a cookie while login is off. |
| `ADMIN_DEV_API_KEY` | Local `x-admin-dev-key` header only |

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Controls in place

1. Middleware redirect `/admin/*` → login without valid session
2. Layout server redirect (defense in depth)
3. Edge block on `/api/admin/*` (except `/api/admin/session`)
4. HMAC-signed session cookie (8h expiry, httpOnly, Secure on Vercel)
5. Login rate limit (8 fails → 15 min block per IP isolate)
6. Timing-safe password compare
7. Security headers (CSP `frame-ancestors`, COOP, Permissions-Policy)
8. `security.txt` at `/.well-known/security.txt`
9. Admin `noindex` + `Cache-Control: no-store`
10. CMS public allowlist — draft/history collections are not exposed on `/api/public/cms/*`
11. Page-editor preview token (`POST /api/admin/cms/preview-token`) — HMAC, 30 min, bound to employee code; preview CSP allows admin host to iframe only with a valid token

## Bootstrap login

- Employee code: `000000`
- Password: value of `DEMO_ADMIN_PASSWORD`
