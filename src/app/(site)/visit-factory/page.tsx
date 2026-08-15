import type { Metadata } from "next";
import { Clock, MapPin, Users } from "lucide-react";
import { FactoryVisitForm } from "@/components/forms/FactoryVisitForm";
import { pageMetadata } from "@/lib/seo/meta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "นัดเยี่ยมชมโรงงาน",
  description:
    "นัดเยี่ยมชมโรงงานผลิตผ้าม่านช่างตี๋ เลือกรอบเช้าหรือรอบเย็น ทีมงานจะติดต่อกลับเพื่อยืนยันวันเวลา",
  path: "/visit-factory",
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
    <div className="min-h-full bg-shell px-6 py-8 sm:px-10 sm:py-12 lg:px-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Factory Visit
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
            นัดเยี่ยมชมโรงงาน
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            ดูขั้นตอนการผลิตผ้าม่านจริง เลือกตัวอย่างเนื้อผ้า และพูดคุยกับทีมงานที่โรงงาน —
            เลือกรอบเช้าหรือรอบเย็นที่สะดวก แล้วส่งคำขอ ทีมงานจะติดต่อกลับเพื่อยืนยันวันเวลา
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
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

        <div className="mt-8 rounded-2xl border border-line bg-white p-4 sm:p-6 md:p-8">
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
