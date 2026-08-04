import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "ทำไมลูกค้าถึงมั่นใจเลือกช่างตี๋ ผ้าม่าน — โชว์รูมจริง โรงงานผลิตเอง วัดหน้างานฟรี",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-navy">เกี่ยวกับเรา</h1>
      <p className="mt-3 text-sm text-brand-red">{siteConfig.legalName}</p>
      <p className="mt-4 text-muted">
        {siteConfig.tagline} · {siteConfig.usp}
      </p>

      <div className="mt-10 space-y-8">
        {siteConfig.aboutHighlights.map((item) => (
          <section key={item.title}>
            <h2 className="font-display text-xl font-semibold text-navy">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/90">{item.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-line bg-paper p-5 text-sm leading-7 text-ink/90">
        <p className="font-semibold text-navy">โชว์รูมช่างตี๋ ผ้าม่าน</p>
        <p className="mt-2">
          {siteConfig.address.line1} {siteConfig.address.line2}{" "}
          {siteConfig.address.city}
        </p>
        <p className="mt-1 text-muted">เวลาทำการ : {siteConfig.hours}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
          >
            ดูแผนที่ร้าน
          </a>
          <Link
            href="/contact"
            className="rounded-md border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-white"
          >
            ติดต่อเรา
          </Link>
          <Link
            href="/quote"
            className="rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-soft"
          >
            ขอใบเสนอราคา
          </Link>
        </div>
      </div>
    </div>
  );
}
