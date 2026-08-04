import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(200,16,46,0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 35%), linear-gradient(135deg, #071526, #0b1f3a 55%, #132b4d)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1.2fr_0.8fr] md:items-end md:py-28">
        <div>
          <p className="text-sm font-semibold tracking-wide text-brand-red-soft">
            {siteConfig.nameEn} · One-Stop Curtain Service
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            {siteConfig.name}
            <span className="block text-white/90">ถูก เร็ว ดี เพราะผลิตเอง</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
            จากโรงงานถึงหน้างาน — ออกแบบ ตัดเย็บ ติดตั้งครบวงจร
            วัดหน้างานฟรี รับงานบ้าน คอนโด ร้านอาหาร และโปรเจกต์องค์กร
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="rounded-full bg-brand-red px-5 py-3 text-sm font-semibold text-white hover:bg-brand-red-soft"
            >
              ขอใบเสนอราคา
            </Link>
            <Link
              href="/estimate"
              className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              ประเมินราคาคร่าวๆ
            </Link>
            <Link
              href="/portfolio"
              className="rounded-full px-5 py-3 text-sm font-semibold text-white/90 hover:text-white"
            >
              ดูผลงาน
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm font-semibold text-white/90">จุดแข็งจากโรงงาน</div>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li>มีทีมผลิตและติดตั้งของตัวเอง</li>
            <li>ควบคุมคุณภาพและคัสตอมได้ทุกความต้องการ</li>
            <li>รับประกันงานติดตั้ง 1 ปีเต็ม</li>
            <li>พร้อมติดตั้งทั่วประเทศไทย</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
