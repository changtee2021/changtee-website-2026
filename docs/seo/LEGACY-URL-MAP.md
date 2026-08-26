# Legacy URL + keyword map — old CMS → new site

**Domain stays:** `https://changtee-curtain.com`  
**Updated:** 26 Aug 2026

Google still shows old CMS paths (`/ม่านพับ_.../:id`, `/ม่านญี่ปุ่น/:id`, `/ฉากกั้นแอร์pvc/:id`). Those URLs **308** to the new App Router pages below. Ads should use the **new URL** as Final URL.

---

## How ranking recovers

1. Same domain (no domain move).
2. Permanent redirect (308) from old path → new path.
3. New page has Thai H1 / title matching the query.
4. GSC recrawl + sitemap (owner). Typical window: **2–8 weeks**.

---

## Hub / trust

| Query / old path | New URL | Status |
| ---------------- | ------- | ------ |
| ช่างตี๋ ผ้าม่าน, `/หน้าแรก/:id` | `/` | 308 |
| ผลงาน, `/ผลงาน/:id` | `/portfolio` | 308 |
| ติดต่อ / เกี่ยวกับเรา | `/contact` | 308 |
| ขอใบเสนอราคา / ประเมินราคา | `/quote` | 308 |
| บทความ | `/blog` | 308 |

---

## Product keywords (commercial)

| Query (TH) | New URL | Redirect keywords |
| ---------- | ------- | ----------------- |
| ผ้าม่าน | `/products/curtain` | ผ้าม่าน |
| ม่านลอน, S-Wave | `/products/curtain/s-wave` | ม่านลอน |
| ม่านจีบ | `/products/curtain/pleat` | ม่านจีบ |
| ม่านพับ, ม่านพับโรมัน | `/products/curtain/roman` | ม่านพับ, ม่านโรมัน, Roman Blinds |
| ม่านตาไก่ | `/products/curtain/eyelet` | ม่านตาไก่ |
| ม่านน้ำตก | `/products/curtain/waterfall` | ม่านน้ำตก |
| ม่านคอกระเช้า | `/products/curtain/tab-top` | ม่านคอกระเช้า |
| ม่านหลุยส์ | `/products/curtain/louis` | ม่านหลุยส์ |
| ม่านโรงพยาบาล | `/products/curtain/hospital` | ม่านโรงพยาบาล |
| ม่านม้วน | `/products/roller-blinds` | ม่านม้วน |
| ม่านม้วนเมจิกสกรีน, zebra | `/products/roller-blinds/zebra` | เมจิกสกรีน, zebra |
| มู่ลี่ | `/products/venetian-blinds` | มู่ลี่ |
| มู่ลี่ไม้ / อลูมิเนียม / ไม้ไผ่ / โรมัน | `/products/venetian-blinds/{wood,aluminium,bamboo,roman-shade}` | ตามชื่อ |
| ม่านปรับแสง | `/products/vertical-blinds` | ม่านปรับแสง |
| ฉากกั้นห้อง, ฉากกั้นแอร์, ฉากกั้นpvc | `/products/pvc-partition` | ฉากกั้น*, pvc |
| ฉากญี่ปุ่น / ยูโร / USA | `/products/pvc-partition/{japanese,euro,usa}` | ตามชื่อ |
| ม่านไฟฟ้า | `/products/motorized` | ม่านไฟฟ้า |
| ผ้าม่านไฟฟ้า | `/products/motorized/curtain` | ผ้าม่านไฟฟ้า |
| ม่านม้วนไฟฟ้า | `/products/motorized/roller` | ม่านม้วนไฟฟ้า |
| ม่านญี่ปุ่น, ผ้าม่านญี่ปุ่น, noren | `/products/print-fabric/noren` | ม่านญี่ปุ่น, noren |
| พิมพ์ผ้า, ม่านพิมพ์ลาย | `/products/print-fabric` | พิมพ์ผ้า |
| ม่านม้วนพิมพ์ลาย | `/products/print-fabric/print-roller` | ม่านม้วนพิมพ์ |
| ม่านม้วนภายนอก | `/products/outdoor-factory/outdoor-roller` | ม่านม้วนภายนอก |
| ม่านรางซิป | `/products/outdoor-factory/zip-blind` | ม่านรางซิป |
| ม่านสกายไลท์ | `/products/outdoor-factory/skylight` | สกายไลท์ |
| ม่านริ้ว, ม่านโรงงาน | `/products/outdoor-factory/pvc-strip` | ม่านริ้ว, โรงงาน |
| วอลเปเปอร์ | `/products/surface/wallpaper` | วอลเปเปอร์ |
| ฟิล์มอาคาร, ฟิล์มกรองแสง | `/products/surface/window-film` | ฟิล์ม* |
| ซักผ้าม่าน | `/products/service/washing` | ซักผ้าม่าน |
| ซ่อมผ้าม่าน | `/products/service/repair` | ซ่อมผ้าม่าน |

Unknown Mongo-id leftover (`/:slug/:24hex`) → `/products`.

---

## Informational (blog — already on new URLs)

| Query | URL |
| ----- | --- |
| เลือกผ้าม่านยังไง | `/blog/which-curtain-style` |
| ม่านม้วน vs มู่ลี่ | `/blog/blinds-comparison` |
| Dimout vs Blackout | `/blog/dimout-vs-blackout` |
| ราคาผ้าม่านคิดยังไง | `/blog/curtain-price-guide` |
| ม่านพับโรมันเหมาะบานไหน | `/blog/roman-blind-guide` |
| ม่านญี่ปุ่น / พิมพ์ผ้า | `/blog` + `/products/print-fabric` |

---

## Ads Final URL (copy for iTop Plus)

Use **only** these — not old `/ชื่อไทย_Und_.../:id`:

```
https://changtee-curtain.com/
https://changtee-curtain.com/products/curtain
https://changtee-curtain.com/products/curtain/roman
https://changtee-curtain.com/products/print-fabric/noren
https://changtee-curtain.com/products/roller-blinds
https://changtee-curtain.com/products/venetian-blinds
https://changtee-curtain.com/products/pvc-partition
https://changtee-curtain.com/products/motorized/curtain
https://changtee-curtain.com/quote
https://changtee-curtain.com/contact
```

---

## Owner (cannot automate)

- [ ] GSC verify + submit `https://changtee-curtain.com/sitemap.xml`
- [ ] Request indexing for money pages: `/`, `/products/print-fabric/noren`, `/products/curtain/roman`, `/products/pvc-partition`
- [ ] GBP NAP = `/contact`
- [ ] Ads Final URL table above
