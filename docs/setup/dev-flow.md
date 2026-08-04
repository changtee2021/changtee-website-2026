# Developer daily flow / ขั้นตอนทำงานประจำวัน

Use this checklist before and after each change.  
ใช้ checklist นี้ก่อนและหลังแก้ไขงานแต่ละครั้ง

## Start here / เริ่มจากตรงนี้

1. Read [docs/README.md](../README.md) first to find the relevant setup, architecture, security, and operations guidance.  
   อ่าน [docs/README.md](../README.md) ก่อน เพื่อหาเอกสาร Setup, โครงสร้าง, ความปลอดภัย และการดูแลระบบที่เกี่ยวข้อง
2. Read the linked document for the area you will change, then keep the change focused.  
   อ่านเอกสารของส่วนที่จะเปลี่ยน แล้วแก้ไขให้อยู่ในขอบเขตงาน

## Folder map / แผนผังโฟลเดอร์

- `src/app/(site)/` — public website pages and layouts / หน้าสาธารณะและ layout ของเว็บไซต์
- `src/app/admin/` — admin pages, login, and admin UI / หน้า login และ UI สำหรับผู้ดูแล
- `src/app/api/` — route handlers and APIs / route handlers และ API
- `src/lib/` — shared application logic and utilities / logic และ utility ที่ใช้ร่วมกัน
- `src/lib/estimate/` — quotation and estimate calculation code / โค้ดคำนวณใบเสนอราคาและประเมินราคา
- `src/lib/cms/` — CMS demo content and helpers / ข้อมูลตัวอย่างและ helper ของ CMS
- `supabase/migrations/` — versioned database schema changes / การเปลี่ยน schema ฐานข้อมูลแบบมี version
- `docs/` — developer, setup, security, and operations documentation / เอกสารสำหรับนักพัฒนา การตั้งค่า ความปลอดภัย และการดูแลระบบ

## Non-negotiable rules / กฎที่ต้องทำ

- Never put secrets in `NEXT_PUBLIC_*` variables; these values are exposed to the browser.  
  ห้ามใส่ secret ในตัวแปร `NEXT_PUBLIC_*` เพราะ browser อ่านค่าได้
- Every admin API route must call `assertAdminApiAccess`.  
  ทุก admin API route ต้องเรียก `assertAdminApiAccess`
- Keep estimate calculations only in `src/lib/estimate/engine.ts`.  
  เก็บ logic คำนวณ estimate ไว้เฉพาะ `src/lib/estimate/engine.ts`
- Keep CMS demo data in `src/lib/cms`.  
  เก็บข้อมูล CMS demo ไว้ใน `src/lib/cms`
- Production lead storage requires Supabase; do not rely on the local lead store in production.  
  การเก็บ lead บน production ต้องใช้ Supabase ห้ามพึ่ง local lead store

## Before finishing / ก่อนส่งงาน

1. Run `npm run typecheck`.  
   รัน `npm run typecheck`
2. Run `npm run build`.  
   รัน `npm run build`
3. Update the relevant documentation if behavior, setup, or operations changed.  
   อัปเดตเอกสารที่เกี่ยวข้อง หากเปลี่ยนพฤติกรรม การตั้งค่า หรือขั้นตอนดูแลระบบ
