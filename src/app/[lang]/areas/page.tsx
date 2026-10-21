import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { loadPortfolioItems } from "@/lib/cms/cms-public-load";
import { publishedPortfolio } from "@/lib/cms/public-content";
import { langFromParams } from "@/lib/i18n/lang-param";
import { pageMetadata } from "@/lib/seo/meta";
import { areaPath, serviceAreas } from "@/lib/service-areas";

export const revalidate = 120;

function hubDescription(names: string[]) {
  const text = names.length
    ? `ผลงานติดตั้งผ้าม่านของช่างตี๋ใน${names.slice(0, 6).join(" ")} วัดหน้างานฟรี ผลิตเองที่โรงงาน`
    : "ช่างตี๋ติดตั้งผ้าม่านทั่วประเทศไทย ดูผลงานจริงทั้งหมดได้ที่หน้ารวมผลงาน";
  return text.length <= 160 ? text : `${text.slice(0, 157).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  const areas = serviceAreas(publishedPortfolio(await loadPortfolioItems()));
  return pageMetadata({
    title: "พื้นที่ติดตั้งผ้าม่าน",
    description: hubDescription(areas.map((area) => area.name)),
    path: "/areas",
    locale,
    translationScope: "cms",
    robots: areas.length ? undefined : { index: false, follow: true },
  });
}

export default async function AreasPage() {
  const areas = serviceAreas(publishedPortfolio(await loadPortfolioItems()));

  return (
    <div className="bg-shell">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
        <h1 className="font-display text-3xl font-normal tracking-tight text-navy sm:text-4xl">
          พื้นที่ติดตั้งผ้าม่าน
        </h1>
        <p className="mt-4 text-base leading-7 text-ink/80">
          ช่างตี๋วัดหน้างานฟรี ผลิตที่โรงงานของเรา และติดตั้งทั่วประเทศไทย
          ด้านล่างคือพื้นที่ที่มีผลงานเผยแพร่จริงอย่างน้อย 3 งาน
        </p>
        {areas.length ? (
          <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white">
            {areas.map((area) => (
              <li key={area.name}>
                <Link
                  href={areaPath(area.name)}
                  className="flex min-h-14 items-center justify-between gap-4 px-5 py-3 text-navy hover:bg-paper"
                >
                  <span className="font-semibold">{area.name}</span>
                  <span className="text-sm text-muted">{area.items.length} งาน</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-sm text-muted">
            ยังไม่มีพื้นที่ที่ผลงานถึงเกณฑ์แสดงเป็นหน้าแยก{" "}
            <Link href="/portfolio" className="font-semibold text-navy hover:text-brand-red">
              ดูผลงานทั้งหมด
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
