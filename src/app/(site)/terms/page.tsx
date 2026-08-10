import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { termsSections } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo/meta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "ข้อกำหนดการใช้บริการ",
  description: `ข้อกำหนดและเงื่อนไขการใช้เว็บไซต์ ${siteConfig.name}`,
  path: "/terms",
});

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
