# GEO — ให้ AI ค้นเจอและแนะนำช่างตี๋

GEO (Generative Engine Optimization) คือการทำให้ ChatGPT, Claude, Perplexity, Gemini / Google AI Overviews และ Copilot อ่านเว็บเราเจอ เข้าใจแบรนด์ถูก และอ้างอิงเราเวลาลูกค้าถาม

## แหล่งข้อมูลกลาง (Single source of truth)

| ไฟล์ | หน้าที่ |
| --- | --- |
| `src/lib/site-config.ts` | ชื่อแบรนด์ (`name`, `nameEn`), `concept`, `identity`, `positioning`, ที่อยู่ เบอร์ LINE |
| `src/lib/brand-facts.ts` | ตัวเลขที่ยืนยันได้ (ประสบการณ์ ประกัน ระยะเวลาติดตั้ง), `BRAND_FAQS`, `knowsAbout`, OfferCatalog |

แก้ข้อมูลที่นี่ที่เดียว แล้ว llms.txt, JSON-LD และ FAQ หน้าแรกจะเปลี่ยนตาม

## สิ่งที่อยู่บนเว็บแล้ว

| URL / ส่วน | รายละเอียด |
| --- | --- |
| `/llms.txt` | สรุปแบรนด์ ข้อมูลสำคัญ ช่องทางติดต่อ หมวดสินค้า (มาตรฐาน llmstxt.org) |
| `/llms-full.txt` | เพิ่มสินค้าทุกรุ่น ห้องเรียนรู้ บทความ และ FAQ ทั้งหมด |
| `/robots.txt` | อนุญาต AI crawler ชัดเจน (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended ฯลฯ) — ยังกัน `/admin`, `/api`, `/leads` |
| JSON-LD หน้าแรก | Organization + Brand (slogan, knowsAbout, contactPoint), HomeAndConstructionBusiness (areaServed, hasOfferCatalog), WebSite + SearchAction, FAQPage |
| FAQ หน้าแรก (`#faq`) | render ฝั่ง server — AI crawler ส่วนใหญ่ไม่รัน JavaScript จึงต้องเห็นใน HTML ตรงๆ |

## กติกา (ห้ามละเมิด)

- FAQPage JSON-LD ต้องตรงกับ FAQ ที่แสดงบนหน้าเสมอ (ทั้งคู่อ่านจาก `BRAND_FAQS`)
- ห้ามใส่ราคา รีวิว คะแนน หรือใบรับรองที่ธุรกิจยังไม่ยืนยัน — ดู “Do NOT do” ใน [AI search analysis](AI-SEARCH-COMPETITIVE-ANALYSIS.md)
- ห้ามซ่อนข้อความ “สำหรับ AI” ในหน้า
- เนื้อหาสำคัญต้องอยู่ใน HTML ฝั่ง server ส่วนที่เป็น `ssr: false` (เช่น `HomeBelowFold`) AI มองไม่เห็น

## งานนอกเว็บ (เจ้าของ / การตลาดต้องทำ)

AI เชื่อข้อมูลที่เจอ **ซ้ำและตรงกันจากหลายแหล่ง** มากกว่าเว็บเราเว็บเดียว

- [ ] Google Business Profile: ชื่อ “ช่างตี๋ ผ้าม่าน (Changtee Phaman)”, ที่อยู่ เบอร์ เวลาเปิด ตรงกับเว็บ, หมวด Curtain store / Window treatment store, ใส่รูปผลงาน
- [ ] Bing Places (Copilot และ ChatGPT search ใช้ข้อมูล Bing) — import จาก Google Business ได้
- [ ] Apple Business Connect (Siri / Apple Maps)
- [ ] Facebook, YouTube, TikTok, LINE OA: ใช้ชื่อ Changtee Phaman + คอนเซป “Crafted by Experience. Designed for Life.” ใน bio และลิงก์กลับเว็บ
- [ ] ขอรีวิวจริงบน Google จากลูกค้า (ไม่ซื้อ ไม่ปลอม)
- [ ] Directory ไทย: Wongnai, Pantip/Lemon8 (ให้ลูกค้าแชร์จริง), เว็บรวมร้านตกแต่งบ้าน
- [ ] Bing Webmaster Tools + Google Search Console: ส่ง `sitemap.xml`

## วิธีทดสอบ (ทุกเดือน)

ถามใน ChatGPT (เปิด search), Perplexity, Gemini และ Google AI Mode:

1. “ช่างตี๋ ผ้าม่าน คือใคร”
2. “ร้านผ้าม่าน คลองสามวา / กรุงเทพตะวันออก แนะนำ”
3. “ติดตั้งม่านไฟฟ้า Somfy กรุงเทพ ที่ไหนดี”
4. “ฉากกั้นแอร์ PVC โรงงาน ติดตั้งทั่วประเทศ”
5. “Changtee Phaman”

จดว่าเจอแบรนด์ไหม อ้างอิง URL ไหน ข้อมูลถูกไหม แล้วอัปเดตตาราง Citation Matrix ใน [AI search analysis](AI-SEARCH-COMPETITIVE-ANALYSIS.md)

ตรวจ structured data: [Rich Results Test](https://search.google.com/test/rich-results) และ [Schema Validator](https://validator.schema.org/) กับหน้าแรก
