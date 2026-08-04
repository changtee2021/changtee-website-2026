# Local development / รันบนเครื่อง

## Install

```bash
cd "C:\Users\Admin\WP GROUP\changtee-website"
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`; the admin workspace is `http://localhost:3000/admin`.

## Environment / ตัวแปรแวดล้อม

Start from `.env.example`. Add Supabase and SMTP credentials only to `.env.local`; never commit it.

For the local demo, `.env.example` enables `ALLOW_OPEN_ADMIN_API=true`. This is for local development only. To exercise the cookie guard locally, change it to `false`, set `DEMO_ADMIN_PASSWORD`, then sign in at `/admin/login`.

## Scripts

- `npm run dev` — local development server
- `npm run typecheck` — TypeScript validation
- `npm run lint` — lint
- `npm run build` — production build
- `npm run seed` — print demo seed payload
