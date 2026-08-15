import type { Metadata } from "next";
import { Clock, MapPin, Users } from "lucide-react";
import { FactoryVisitForm } from "@/components/forms/FactoryVisitForm";
import { FactorySitesSection } from "@/components/visit/FactorySitesSection";
import { FactoryVisitHero } from "@/components/visit/FactoryVisitHero";
import { pageMetadata } from "@/lib/seo/meta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "นัดเยี่ยมชมโรงงาน",
  description:
    "นัดเยี่ยมชมโรงงานผลิตผ้าม่านช่างตี๋ เลือกรอบเช้าหรือรอบเย็น ทีมงานจะติดต่อกลับเพื่อยืนยันวันเวลา",
  path: "/visit-factory",
  image: "/images/factory/visit-01-production.png",
});

const HIGHLIGHTS = [
  {
    icon: Clock,
    title: "2 รอบให้เลือก",
    body: "รอบเช้า 09:00 - 12:00 น. และรอบเย็น 13:00 - 16:00 น.",
  },
  {
    icon: MapPin,
    title: "โรงงานผลิตจริง",
    body: siteConfig.address.line1 + " " + siteConfig.address.line2,
  },
  {
    icon: Users,
    title: "รับได้ทั้งเดี่ยวและกรุ๊ป",
    body: "เหมาะสำหรับลูกค้าองค์กร ดีลเลอร์ หรือผู้สนใจสั่งผลิตจำนวนมาก",
  },
] as const;

export default function VisitFactoryPage() {
  return (
    <div className="bg-shell pb-16">
      <FactoryVisitHero />

      <div className="mx-auto w-full max-w-5xl px-6 pt-8 sm:px-10 sm:pt-12 lg:px-16">
        <FactorySitesSection />

        <div className="grid gap-3 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper text-navy">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-navy">{title}</span>
              <span className="text-xs leading-relaxed text-muted">{body}</span>
            </div>
          ))}
        </div>

        <div
          id="visit-form"
          className="mt-8 scroll-mt-24 rounded-2xl border border-line bg-white p-4 sm:p-6 md:p-8"
        >
          <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
            ส่งคำขอนัดเยี่ยมชม
          </h2>
          <p className="mt-1 text-sm text-muted">
            กรอกข้อมูลด้านล่าง ทีมงานจะติดต่อกลับภายใน 1 วันทำการเพื่อยืนยันการนัด
          </p>
          <div className="mt-6">
            <FactoryVisitForm />
          </div>
        </div>
      </div>
    </div>
  );
}
