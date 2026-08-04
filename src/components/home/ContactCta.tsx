import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function ContactCta() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-2xl font-bold text-navy md:text-3xl">
          ขอใบเสนอราคา
        </h2>
        <div className="mx-auto mt-2 h-1 w-16 bg-brand-red" />
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          หน้าร้านจริง มีโชว์รูมให้เลือกแบบ ครบ จบ ในที่เดียว
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line">
            <Image
              src="/images/mock/showroom.png"
              alt="โชว์รูมช่างตี๋"
              fill
              className="object-cover"
              sizes="640px"
            />
          </div>
          <div className="rounded-lg border border-line bg-paper p-6">
            <h3 className="font-display text-xl font-semibold text-navy">ติดต่อโชว์รูม</h3>
            <p className="mt-3 text-sm leading-7 text-ink/90">
              {siteConfig.address.line1}
              <br />
              {siteConfig.address.line2}
              <br />
              {siteConfig.address.city}
            </p>
            <p className="mt-3 text-sm text-muted">เวลาทำการ : {siteConfig.hours}</p>
            <p className="mt-2 text-sm">
              โทร:{" "}
              <a href={`tel:${siteConfig.phoneTel}`} className="font-semibold text-navy underline">
                {siteConfig.phoneDisplay}
              </a>
            </p>
            <p className="mt-2 text-sm">
              LINE:{" "}
              <a
                href={siteConfig.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#06C755] underline"
              >
                {siteConfig.lineId}
              </a>
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Image
                src={siteConfig.lineQrUrl}
                alt={`QR LINE ${siteConfig.lineId}`}
                width={88}
                height={88}
                className="h-20 w-20 rounded-md border border-line bg-white object-contain p-1"
              />
              <a
                href={siteConfig.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-[#06C755] px-4 py-2 text-sm font-semibold text-white"
              >
                แอดไลน์คุยกับเรา
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/quote"
                className="rounded-md bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-soft"
              >
                ขอใบเสนอราคา
              </Link>
              <Link
                href="/estimate"
                className="rounded-md border border-navy px-5 py-2.5 text-sm font-semibold text-navy"
              >
                ประเมินราคา
              </Link>
              <a
                href="/brochure/company-profile-2026.pdf"
                className="rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-navy"
              >
                Download Brochure
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
