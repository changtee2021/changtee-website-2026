import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { MobileDock } from "@/components/layout/MobileDock";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { ConsentAwareScripts } from "@/components/layout/ConsentAwareScripts";
import { SiteAnalyticsBeacon } from "@/components/layout/SiteAnalyticsBeacon";
import { SitePreviewRoot } from "@/components/preview/SitePreviewRoot";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SitePreviewRoot>
      <div className="flex min-h-full flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <ConsentAwareScripts />
        <SiteAnalyticsBeacon />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          ข้ามไปเนื้อหา
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-x-clip outline-none">
          {children}
        </main>
        <SiteFooter />
        <FloatingActions />
        <MobileDock />
        <CookieBanner />
      </div>
    </SitePreviewRoot>
  );
}
