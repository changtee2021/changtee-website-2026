import { Suspense } from "react";
import type { Metadata } from "next";
import { FactoryVisitHero } from "@/components/visit/FactoryVisitHero";
import { VisitBookingSection } from "@/components/visit/VisitBookingSection";
import { parseVisitMode } from "@/lib/visits/modes";
import { pageMetadata } from "@/lib/seo/meta";

type PageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { mode } = await searchParams;
  if (parseVisitMode(mode) === "product-presentation") {
    return pageMetadata({
      title: "นัดนำเสนอสินค้า",
      description:
        "นัดนำเสนอสินค้าผ้าม่านสำหรับนิติบุคคลและองค์กร ทีมช่างตี๋เข้าพบที่บริษัท หรือนัดพรีเซนต์ที่โชว์รูม",
      path: "/visit-factory?mode=presentation",
      image: "/images/factory/visit-01-production.png",
    });
  }
  return pageMetadata({
    title: "นัดเยี่ยมชมโรงงานเรา",
    description:
      "นัดเยี่ยมชมโรงงานเรา ดูการผลิตผ้าม่านช่างตี๋ เลือกรอบเช้าหรือรอบเย็น ทีมงานจะติดต่อกลับเพื่อยืนยันวันเวลา",
    path: "/visit-factory",
    image: "/images/factory/visit-01-production.png",
  });
}

export default function VisitFactoryPage() {
  return (
    <div className="bg-shell pb-16">
      <Suspense>
        <FactoryVisitHero />
        <VisitBookingSection />
      </Suspense>
    </div>
  );
}
