"use client";

import { useSearchParams } from "next/navigation";
import { Briefcase, Clock, MapPin, Presentation, Users } from "lucide-react";
import { FactoryVisitForm } from "@/components/forms/FactoryVisitForm";
import { ProductPresentationForm } from "@/components/forms/ProductPresentationForm";
import { FactorySitesSection } from "@/components/visit/FactorySitesSection";
import { VisitModeSwitch } from "@/components/visit/VisitModeSwitch";
import { parseVisitMode } from "@/lib/visits/modes";
import { siteConfig } from "@/lib/site-config";

const VISIT_HIGHLIGHTS = [
  {
    icon: Clock,
    title: "2 รอบให้เลือก",
    body: "รอบเช้า 09:00 - 12:00 น. และรอบเย็น 13:00 - 16:00 น.",
  },
  {
    icon: MapPin,
    title: "โรงงานผลิตจริง",
    body: `${siteConfig.address.line1} ${siteConfig.address.line2}`,
  },
  {
    icon: Users,
    title: "รับได้ทั้งเดี่ยวและกรุ๊ป",
    body: "เหมาะสำหรับลูกค้าองค์กร ดีลเลอร์ หรือผู้สนใจสั่งผลิตจำนวนมาก",
  },
] as const;

const PRESENTATION_HIGHLIGHTS = [
  {
    icon: Briefcase,
    title: "นิติบุคคลเท่านั้น",
    body: "รับนัดจากบริษัท หจก. หน่วยงานราชการ และองค์กร ไม่รับบ้านพักอาศัย",
  },
  {
    icon: Presentation,
    title: "พกตัวอย่างไปพรีเซนต์",
    body: "ทีมงานเข้าพบที่บริษัท นัดที่โชว์รูม หรือประชุมออนไลน์ ประมาณ 45–60 นาที",
  },
  {
    icon: Clock,
    title: "ยืนยันก่อนทุกครั้ง",
    body: "ทีมงานติดต่อกลับภายใน 1 วันทำการ และไม่เดินทางโดยไม่ยืนยันนัด",
  },
] as const;

export function VisitBookingSection() {
  const searchParams = useSearchParams();
  const mode = parseVisitMode(searchParams.get("mode"));
  const isPresentation = mode === "product-presentation";
  const highlights = isPresentation ? PRESENTATION_HIGHLIGHTS : VISIT_HIGHLIGHTS;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pt-8 sm:px-10 sm:pt-12 lg:px-16">
      <VisitModeSwitch mode={mode} className="mx-auto max-w-xl" />

      {isPresentation ? null : (
        <div className="mt-8">
          <FactorySitesSection />
        </div>
      )}

      <div className={`grid gap-3 sm:grid-cols-3 ${isPresentation ? "mt-8" : ""}`}>
        {highlights.map(({ icon: Icon, title, body }) => (
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
          {isPresentation ? "ส่งคำขอนัดนำเสนอสินค้า" : "ส่งคำขอนัดเยี่ยมชม"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {isPresentation
            ? "สำหรับนิติบุคคลและองค์กร ทีมงานจะติดต่อกลับภายใน 1 วันทำการเพื่อยืนยันการนัด"
            : "กรอกข้อมูลด้านล่าง ทีมงานจะติดต่อกลับภายใน 1 วันทำการเพื่อยืนยันการนัด"}
        </p>
        <div className="mt-6">
          {isPresentation ? <ProductPresentationForm /> : <FactoryVisitForm />}
        </div>
      </div>
    </div>
  );
}
