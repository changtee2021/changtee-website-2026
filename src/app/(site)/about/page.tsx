import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Gauge,
  Home,
  PenTool,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CompanyContactForm } from "@/components/forms/CompanyContactForm";
import { HomePanel, PanelHeading } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import {
  AboutHeroCms,
  AboutOneStopCms,
} from "@/components/about/AboutCmsBlocks";
import {
  aboutClients,
  aboutSegments,
  aboutValues,
} from "@/lib/about-content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description:
    "ช่างม่านที่เข้าใจคุณ — ออกแบบ ผลิต ติดตั้งผ้าม่านครบวงจร มีโรงงานเอง วัดหน้างานฟรี รับประกัน 1 ปี",
};

const valueIcons = [Zap, ShieldCheck, Gauge] as const;

const segmentIcons = {
  home: Home,
  building: Building2,
  pen: PenTool,
} as const;

export default function AboutPage() {
  return (
    <div className="bg-shell pb-3 sm:pb-4">
      <AboutHeroCms />

      {/* Values */}
      <HomePanel>
        <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {aboutValues.map((item, i) => {
            const Icon = valueIcons[i] ?? ShieldCheck;
            return (
              <Reveal key={item.key} delayStep={i} className="px-6 py-7 sm:px-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-navy">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-brand-red uppercase">
                  {item.key}
                </p>
                <h2 className="mt-1.5 font-display text-lg font-semibold text-navy">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </HomePanel>

      {/* One stop + story image */}
      <HomePanel>
        <AboutOneStopCms>
          <ul className="mt-6 space-y-2 text-sm text-ink/90">
            <li>· วัดหน้างานฟรี ทั้งบ้านและโปรเจกต์องค์กร</li>
            <li>· มีโรงงานผลิตเอง ส่งงานไว คุมคุณภาพได้</li>
            <li>· รับประกันงานติดตั้ง 1 ปีเต็ม</li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={siteConfig.brochureUrl}
              className="inline-flex rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
            >
              {siteConfig.brochureLabel}
            </a>
            <Link
              href="/portfolio"
              className="inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
            >
              ดูผลงานติดตั้ง
            </Link>
          </div>
        </AboutOneStopCms>
      </HomePanel>

      {/* Segments */}
      <HomePanel>
        <div className="p-7 sm:p-9 md:p-12">
          <PanelHeading title="งานที่เราดูแล" />
          <div className="relative mt-10">
            <div
              aria-hidden
              className="pointer-events-none absolute top-10 right-[16.5%] left-[16.5%] hidden h-0.5 bg-brand-red md:block"
            />
            <div className="grid gap-8 md:grid-cols-3 md:gap-4">
              {aboutSegments.map((seg, i) => {
                const Icon = segmentIcons[seg.icon];
                return (
                  <Reveal
                    key={seg.label}
                    delayStep={i}
                    as="article"
                    className="relative z-10 px-2 text-center"
                  >
                    <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-paper text-navy ring-4 ring-panel">
                      <Icon className="h-9 w-9" strokeWidth={1.6} aria-hidden />
                    </span>
                    <p className="mt-5 text-[11px] font-semibold tracking-[0.16em] text-brand-red uppercase">
                      {seg.label}
                    </p>
                    <h3 className="mt-1.5 font-display text-lg font-semibold text-navy">
                      {seg.title}
                    </h3>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </HomePanel>

      {/* Clients */}
      <HomePanel tone="clear">
        <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
          <PanelHeading title={aboutClients.title} />
          <Reveal className="mt-8">
            <Image
              src={aboutClients.image}
              alt="โลโก้ลูกค้าองค์กรของช่างตี๋"
              width={1390}
              height={684}
              unoptimized
              className="mx-auto h-auto w-full max-w-5xl object-contain"
            />
          </Reveal>
        </div>
      </HomePanel>

      {/* Showroom + company form */}
      <HomePanel>
        <div
          id="company-contact"
          className="grid gap-10 scroll-mt-24 p-7 sm:p-9 md:grid-cols-2 md:p-12"
        >
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-red uppercase">
              สำหรับบริษัทและองค์กร
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-navy md:text-3xl">
              อยากคุยโปรเจกต์? ทักมาได้เลย
            </h2>

            <div className="mt-8 text-sm leading-7">
              <p className="font-semibold text-navy">{siteConfig.legalName}</p>
              <p className="mt-2 text-ink/90">
                {siteConfig.address.line1}
                <br />
                {siteConfig.address.line2}
                <br />
                {siteConfig.address.city}
              </p>
              <p className="mt-2 text-muted">เวลาทำการ : {siteConfig.hours}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {siteConfig.saleContacts.slice(0, 2).map((c) => (
                  <a
                    key={c.phoneTel}
                    href={`tel:${c.phoneTel}`}
                    className="font-medium text-navy hover:underline"
                  >
                    {c.phoneDisplay}
                  </a>
                ))}
                <a
                  href={`mailto:${siteConfig.emailTo}`}
                  className="font-medium text-navy hover:underline"
                >
                  {siteConfig.emailTo}
                </a>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy/90"
                >
                  ดูแผนที่โชว์รูม
                </a>
                <a
                  href={siteConfig.lineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#06C755] px-4 py-2 text-xs font-semibold text-white"
                >
                  LINE {siteConfig.lineId}
                </a>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl">
              <iframe
                title="แผนที่โชว์รูมช่างตี๋ ผ้าม่าน"
                src={siteConfig.mapsEmbedUrl}
                className="aspect-[16/10] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>

          <Reveal delayStep={1}>
            <h3 className="font-display text-xl font-semibold text-navy">
              ฟอร์มติดต่อองค์กร
            </h3>
            <div className="mt-5">
              <CompanyContactForm />
            </div>
          </Reveal>
        </div>
      </HomePanel>
    </div>
  );
}
