import type { Metadata } from "next";
import { IconNoren } from "@/components/icons/product-line-icons";
import { NorenQuoteDesigner } from "@/components/noren/NorenQuoteDesigner";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return pageMetadata({
    title: "ออกแบบม่านญี่ปุ่น ขอใบเสนอราคา",
    description:
      "ออกแบบม่านญี่ปุ่น พิมพ์โลโก้หรือลายตามไฟล์ ดูราคาประมาณการทันที ตร.ม.ละ 1,300 บาท ขั้นต่ำ 1 ตร.ม. ต่อชุด แล้วส่งขอใบเสนอราคาจากช่างตี๋",
    path: "/quote/noren",
    locale,
  });
}

export default function NorenQuotePage() {
  return (
    <div className="min-h-full bg-shell px-6 py-8 sm:px-10 sm:py-12 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-start gap-3">
          <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white text-navy sm:size-12">
            <IconNoren className="size-7 sm:size-8" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
              ออกแบบม่านญี่ปุ่น
            </h1>
            <p className="mt-2 text-sm text-muted sm:text-base">
              อัปโหลดไฟล์ภาพ โลโก้ด้วยตนเอง พร้อมกดส่งขอใบเสนอราคาได้เลย
            </p>
          </div>
        </div>
        <NorenQuoteDesigner />
      </div>
    </div>
  );
}
