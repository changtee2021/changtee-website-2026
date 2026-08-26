# Marketing URL Handoff — iTop Plus / Google Ads

**For:** iTop Plus (IT) + internal marketing  
**Site owner:** ช่างตี๋ ผ้าม่าน  
**Last updated:** 26 Aug 2026

---

## Canonical domain (use everywhere)

| Use | URL |
| --- | --- |
| **Final URL (all campaigns)** | `https://changtee-curtain.com/` |
| **Display URL** | `changtee-curtain.com` |
| **Sitemap (GSC)** | `https://changtee-curtain.com/sitemap.xml` |
| **Admin** | `https://changtee-curtain.com/admin` |

**Do not use as Final URL:**

- `https://changtee-website-2026.vercel.app/` — legacy Vercel hostname; **301 → changtee-curtain.com** (safety net only)
- Branch preview URLs (`*-git-*.vercel.app`) — internal QA only, `noindex`
- Old CMS paths (`/หน้าแรก/...`, `/ผลงาน/...`) — redirected; do not buy ads to these

---

## Message template (copy to iTop Plus)

> ขอให้ตั้ง **Final URL ทุกแคมเปญ = https://changtee-curtain.com/**  
> ไม่ใช้ `changtee-website-2026.vercel.app` แล้ว (เป็น URL deploy เก่า — ระบบ redirect ไปโดเมนจริงให้แล้ว แต่ Ads ควรชี้โดเมนจริงตั้งแต่ต้น)  
> **Sitelink** ใช้ตามกลุ่มสินค้าในแคมเปญ + หน้า Contact / Quote ตามตารางด้านล่าง  
> **Google Search Console** property = `changtee-curtain.com` + ส่ง sitemap

---

## Sitelink library (pick per campaign)

Base: `https://changtee-curtain.com`

| Label (TH) | Path | When to use |
| ---------- | ---- | ----------- |
| สินค้าและบริการ | `/products` | Generic brand / awareness |
| ม่านญี่ปุ่น | `/products/print-fabric/noren` | Japanese / noren campaigns |
| ม่านพับ | `/products/curtain/roman` | Roman blind campaigns |
| ฉากกั้นห้อง / กั้นแอร์ | `/products/pvc-partition` | PVC partition campaigns |
| ผ้าม่าน | `/products/curtain` | Curtain campaigns |
| ม่านม้วน | `/products/roller-blinds` | Roller / sunscreen |
| มู่ลี่ | `/products/venetian-blinds` | Venetian |
| ม่านปรับแสง | `/products/vertical-blinds` | Vertical |
| ม่านไฟฟ้า | `/products/motorized` | Motor / smart home |
| ม่านภายนอก / โรงงาน | `/products/outdoor-factory` | Outdoor / industrial |
| ผลงานติดตั้ง | `/portfolio` | Trust / proof |
| ขอใบเสนอราคา | `/quote` | Lead / conversion |
| **ติดต่อเรา** | `/contact` | Contact sitelink (required) |
| บทความ | `/blog` | Content remarketing |
| ห้องเรียนรู้ | `/learn` | Education / how-to |

**Rule:** Match sitelinks to **ad group product** — do not list all 7 pillars on every ad.

---

## NAP (must match GBP + site footer)

Use exactly on Google Business Profile and ad extensions:

| Field | Value |
| ----- | ----- |
| Business name | ช่างตี๋ ผ้าม่าน / Chang Tee Curtain |
| Address | 310 ถนนไทยรามัญ แขวงสามวาตะวันตก เขตคลองสามวา กรุงเทพมหานคร 10510 |
| Phone (primary) | 092-887-4288 |
| Hours | ทุกวัน 08:00–20:00 |
| Maps | https://maps.app.goo.gl/K7NkC262igw8hy3a9 |
| LINE OA | https://lin.ee/7Ul6K4n (`@chang-tee`) |

Source of truth: `src/lib/site-config.ts` + `/contact` page.

---

## Our side (web team) — done / automated

- Production on `changtee-curtain.com` with SEO P0/P1
- `301` legacy CMS URLs + `www` → apex
- `301` `changtee-website-2026.vercel.app` → `changtee-curtain.com`
- Preview / branch `*.vercel.app` (except production hostname above): `noindex`
- Analytics DB + admin dashboard live

---

## Agency checklist (iTop Plus)

- [ ] All Final URLs → `https://changtee-curtain.com/...`
- [ ] Sitelinks per campaign product + `/contact` (and `/quote` if lead goal)
- [ ] GSC property + sitemap submitted
- [ ] GBP NAP matches table above
- [ ] Bing Webmaster (optional)
- [ ] UTM naming agreed with internal team (optional)

---

## Verify after changes

```bash
curl -sI "https://changtee-curtain.com/" | findstr /i "HTTP"
curl -sI "https://changtee-website-2026.vercel.app/" | findstr /i "HTTP location"
curl -s "https://changtee-curtain.com/api/public/health"
```

Expected: apex `200`; vercel hostname `308` + `Location: https://changtee-curtain.com/`.
