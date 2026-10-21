import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { termsSections } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return pageMetadata({
    title: "ข้อกำหนดการใช้บริการ",
    description: `ข้อกำหนดและเงื่อนไขการใช้เว็บไซต์ ${siteConfig.name}`,
    path: "/terms",
    locale,
  });
}

export default function TermsPage() {
  return (
    <LegalDoc
      currentPath="/terms"
      title="ข้อกำหนดการใช้บริการ"
      subtitle="เงื่อนไขการใช้เว็บไซต์ ข้อมูลสินค้า การขอใบเสนอราคา และข้อจำกัดความรับผิด"
      sections={termsSections}
    />
  );
}
