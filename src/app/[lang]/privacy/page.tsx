import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { legalContact, privacySections } from "@/lib/legal";
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
    title: "นโยบายความเป็นส่วนตัว (PDPA)",
    description: `นโยบายคุ้มครองข้อมูลส่วนบุคคลของ ${siteConfig.legalName} ตาม PDPA`,
    path: "/privacy",
    locale,
  });
}

export default function PrivacyPage() {
  return (
    <LegalDoc
      currentPath="/privacy"
      title="นโยบายความเป็นส่วนตัว"
      subtitle={`${legalContact.controller} คุ้มครองข้อมูลส่วนบุคคลตาม PDPA เมื่อท่านใช้เว็บไซต์ ขอใบเสนอราคา หรือติดต่อเรา`}
      sections={privacySections}
    />
  );
}
