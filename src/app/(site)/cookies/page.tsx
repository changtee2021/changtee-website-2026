import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { CookieSettingsButton } from "@/components/legal/CookieSettingsButton";
import { cookieSections } from "@/lib/legal";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "นโยบายคุกกี้",
  description: `นโยบายคุกกี้และการตั้งค่าความยินยอมของ ${siteConfig.name}`,
};

export default function CookiesPage() {
  return (
    <>
      <LegalDoc
        currentPath="/cookies"
        title="นโยบายคุกกี้"
        subtitle="อธิบายประเภทคุกกี้ที่ใช้บนเว็บไซต์ และวิธีให้หรือถอนความยินยอมตาม PDPA"
        sections={cookieSections}
      />
      <div className="mx-auto max-w-6xl px-4 pb-12 lg:pl-[252px]">
        <div className="rounded-xl border border-line bg-paper p-4">
          <p className="text-sm text-muted">
            จัดการความยินยอมคุกกี้ได้ทันทีจากปุ่มด้านล่าง
          </p>
          <div className="mt-3">
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </>
  );
}
