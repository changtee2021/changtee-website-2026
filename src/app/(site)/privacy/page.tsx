import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { legalContact, privacySections } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo/meta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "นโยบายความเป็นส่วนตัว (PDPA)",
  description: `นโยบายคุ้มครองข้อมูลส่วนบุคคลของ ${siteConfig.legalName} ตาม PDPA`,
  path: "/privacy",
});

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
