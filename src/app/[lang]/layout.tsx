import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import {
  Noto_Sans_Khmer,
  Noto_Sans_Lao,
  Noto_Sans_Myanmar,
  Noto_Sans_SC,
  Noto_Sans_TC,
} from "next/font/google";
import { notFound } from "next/navigation";
import { T } from "@/components/i18n/T";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { ConsentAwareScripts } from "@/components/layout/ConsentAwareScripts";
import { SiteAnalyticsBeacon } from "@/components/layout/SiteAnalyticsBeacon";
import { SitePreviewRoot } from "@/components/preview/SitePreviewRoot";
import { AutoThaiText } from "@/components/i18n/AutoThaiText";
import { thaiTextPack, tx } from "@/lib/i18n/content/thai-text/server";
import {
  generateLangStaticParams,
  langFromParams,
  resolveLangParam,
} from "@/lib/i18n/lang-param";
import type { Locale } from "@/lib/i18n/locale";
import { siteConfig } from "@/lib/site-config";

const myanmar = Noto_Sans_Myanmar({
  variable: "--font-locale",
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
  preload: false,
  display: "swap",
});

const lao = Noto_Sans_Lao({
  variable: "--font-locale",
  subsets: ["lao"],
  weight: ["400", "500", "600", "700"],
  preload: false,
  display: "swap",
});

const khmer = Noto_Sans_Khmer({
  variable: "--font-locale",
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  preload: false,
  display: "swap",
});

const sc = Noto_Sans_SC({
  variable: "--font-locale",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
  display: "swap",
});

const tc = Noto_Sans_TC({
  variable: "--font-locale",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
  display: "swap",
});

function localeFontClass(locale: Locale): string {
  switch (locale) {
    case "my":
      return myanmar.variable;
    case "lo":
      return lao.variable;
    case "km":
      return khmer.variable;
    case "zh-Hans":
      return sc.variable;
    case "zh-Hant":
      return tc.variable;
    default:
      return "";
  }
}

export function generateStaticParams() {
  return generateLangStaticParams();
}

/** Thai keeps the CMS SEO defaults from the root layout; other locales get a translated title/template. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  if (locale === "th") return {};
  const name = tx(locale, siteConfig.name);
  return {
    title: {
      absolute: `${name} | ${tx(locale, siteConfig.tagline)}`,
      template: `%s | ${name}`,
    },
    description: tx(locale, siteConfig.description),
    applicationName: name,
  };
}

export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: langParam } = await params;
  let locale: Locale;
  try {
    locale = resolveLangParam(langParam);
  } catch {
    notFound();
  }

  const fontClass = localeFontClass(locale);
  const localeStyle: CSSProperties | undefined = fontClass
    ? ({
        "--font-body": "var(--font-locale)",
        "--font-display-family": "var(--font-locale)",
        // --font-sans is resolved at :root, so redefine it here too or body text keeps the Thai face.
        "--font-sans": 'var(--font-locale), "IBM Plex Sans Thai", sans-serif',
        fontFamily: "var(--font-sans)",
      } as CSSProperties)
    : undefined;

  return (
    <LocaleProvider locale={locale} thaiText={thaiTextPack(locale)}>
      <AutoThaiText locale={locale} />
      <SitePreviewRoot>
        <div
          className={`flex min-h-full flex-col${fontClass ? ` ${fontClass}` : ""}`}
          data-locale={locale}
          style={localeStyle}
        >
          <ConsentAwareScripts />
          <SiteAnalyticsBeacon />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            <T k="skip.content" />
          </a>
          <SiteHeader />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-x-clip outline-none"
          >
            {children}
          </main>
          <SiteFooter />
          <FloatingActions />
          <CookieBanner />
        </div>
      </SitePreviewRoot>
    </LocaleProvider>
  );
}
