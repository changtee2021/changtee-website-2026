import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { ConsentAwareScripts } from "@/components/layout/ConsentAwareScripts";
import { SitePreviewRoot } from "@/components/preview/SitePreviewRoot";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SitePreviewRoot>
      <div className="flex min-h-full flex-col">
        <ConsentAwareScripts />
        <SiteHeader />
        <main className="flex-1 overflow-x-clip">{children}</main>
        <SiteFooter />
        <FloatingActions />
        <CookieBanner />
      </div>
    </SitePreviewRoot>
  );
}
