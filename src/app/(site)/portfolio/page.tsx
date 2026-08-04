import Image from "next/image";
import type { Metadata } from "next";
import { portfolioMock } from "@/lib/mock-content";

export const metadata: Metadata = {
  title: "ผลงาน",
  description: "ผลงานติดตั้งผ้าม่าน ม่านม้วน ฉากกั้น และโปรเจกต์องค์กรของช่างตี๋",
};

const filters = [
  "ทั้งหมด",
  "ม่านม้วน",
  "ผ้าม่าน",
  "ฉากกั้นห้อง",
  "บ้าน/คอนโด",
  "ร้านอาหาร",
  "องค์กร",
];

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-navy">ผลงานการติดตั้งของช่างตี๋</h1>
      <div className="mt-2 h-1 w-16 bg-brand-red" />
      <p className="mt-3 max-w-2xl text-muted">
        รวมผลงานบ้าน คอนโด ร้านอาหาร และโปรเจกต์องค์กร — รูปตัวอย่างจากเว็บเดิม + mockup
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <span
            key={f}
            className={`rounded-full border px-3 py-1 text-sm ${f === "ทั้งหมด" ? "border-navy bg-navy text-white" : "border-line bg-white text-ink"}`}
          >
            {f}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...portfolioMock, ...portfolioMock].map((item, i) => (
          <article key={`${item.title}-${i}`} className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="relative aspect-[4/3]">
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="360px" />
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded bg-paper px-2 py-0.5 text-[11px] text-muted">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-2 font-semibold text-navy">{item.title}</h2>
              <p className="mt-1 text-xs text-brand-red">{item.place}</p>
              <p className="mt-2 text-sm text-muted">{item.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
