import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/forms/UnsubscribeForm";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return pageMetadata({
    title: "ถอนการรับข่าวสาร",
    description: "ยกเลิกการรับข่าวสารและโปรโมชันทางอีเมลจากช่างตี๋ ผ้าม่าน",
    path: "/unsubscribe",
    robots: { index: false, follow: false },
    locale,
  });
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-2xl font-semibold text-navy">
        ถอนการรับข่าวสาร
      </h1>
      <p className="mt-3 text-sm text-muted">
        กดยืนยันเพื่อหยุดรับโปรโมชันและบทความทางอีเมล การถอนนี้ไม่กระทบคำขอใบเสนอราคาหรือการติดต่องานที่ส่งมาแล้ว
      </p>
      <UnsubscribeForm token={token?.trim() || ""} />
    </div>
  );
}
