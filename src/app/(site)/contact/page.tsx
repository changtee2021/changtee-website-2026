import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ContactHeaderCms } from "@/components/contact/ContactHeaderCms";
import { LeadForm } from "@/components/forms/LeadForm";
import { pageMetadata } from "@/lib/seo/meta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "ติดต่อเรา",
  description:
    "ติดต่อโชว์รูมช่างตี๋ ผ้าม่าน แผนที่ร้าน SALE Tel และแอดไลน์ @chang-tee",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-12">
      <ContactHeaderCms />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-line bg-white p-5">
            <h2 className="font-semibold text-navy">ที่อยู่โชว์รูม</h2>
            <p className="mt-3 text-sm leading-7 text-ink/90">
              {siteConfig.address.line1}
              <br />
              {siteConfig.address.line2}
              <br />
              {siteConfig.address.city}
            </p>
            <p className="mt-2 text-sm text-muted">เวลาทำการ : {siteConfig.hours}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
              >
                View on Google Maps
              </a>
              <Link
                href="/quote"
                className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
              >
                ขอใบเสนอราคา – Quotation
              </Link>
              <a
                href={siteConfig.brochureUrl}
                className="rounded-md border border-line px-4 py-2 text-sm text-muted hover:text-navy"
              >
                {siteConfig.brochureLabel}
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line">
            <iframe
              title="แผนที่โชว์รูมช่างตี๋ ผ้าม่าน"
              src={siteConfig.mapsEmbedUrl}
              className="aspect-[16/10] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-5">
              <h2 className="font-semibold text-navy">SALE Tel</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {siteConfig.saleContacts.map((c) => (
                  <li
                    key={c.phoneTel}
                    className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3"
                  >
                    <span className="text-muted">{c.name}</span>
                    <a
                      href={`tel:${c.phoneTel}`}
                      className="shrink-0 font-medium text-navy hover:underline"
                    >
                      {c.phoneDisplay}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-line bg-white p-5">
              <h2 className="font-semibold text-navy">ติดต่อเพิ่มเติม</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {siteConfig.hotlineContacts.map((c) => (
                  <li
                    key={c.phoneTel}
                    className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3"
                  >
                    <span className="text-muted">{c.name}</span>
                    <a
                      href={`tel:${c.phoneTel}`}
                      className="shrink-0 font-medium text-navy hover:underline"
                    >
                      {c.phoneDisplay}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm">
                <span className="text-muted">Email</span>
                <br />
                <a
                  href={`mailto:${siteConfig.emailTo}`}
                  className="font-medium text-navy hover:underline"
                >
                  {siteConfig.emailTo}
                </a>
              </p>
              <p className="mt-3 text-sm">
                <span className="text-muted">LINE</span>
                <br />
                <a
                  href={siteConfig.lineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#06C755] hover:underline"
                >
                  {siteConfig.lineId}
                </a>
              </p>
            </div>
          </div>

          <div className="inline-flex flex-col items-center rounded-xl border border-line bg-white p-4">
            <Image
              src={siteConfig.lineQrUrl}
              alt={`QR Code LINE ${siteConfig.lineId}`}
              width={180}
              height={180}
              className="h-44 w-44 object-contain"
            />
            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 rounded-full bg-[#06C755] px-4 py-2 text-sm font-semibold text-white"
            >
              เพิ่มเพื่อน LINE
            </a>
            <p className="mt-2 text-xs text-muted">{siteConfig.lineId}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line p-6">
          <h2 className="font-semibold text-navy">ส่งข้อความถึงเรา</h2>
          <p className="mt-1 text-sm text-muted">ทีมงานจะติดต่อกลับโดยเร็ว</p>
          <div className="mt-4">
            <LeadForm source="contact" submitLabel="ส่งข้อความ" />
          </div>
        </div>
      </div>
    </div>
  );
}
