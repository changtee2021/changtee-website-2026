import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { IBM_Plex_Sans_Thai, Outfit, Prompt } from "next/font/google";
import { loadSeoDefaults } from "@/lib/seo/seo-defaults";
import { absoluteUrl, defaultOgImagePath, DEFAULT_OG_IMAGE_HEIGHT, DEFAULT_OG_IMAGE_WIDTH } from "@/lib/seo/meta";
import { siteConfig } from "@/lib/site-config";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const sans = IBM_Plex_Sans_Thai({
  variable: "--font-body",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Prompt({
  variable: "--font-display-family",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
});

const modern = Outfit({
  variable: "--font-modern-family",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await loadSeoDefaults();
  const titleDefault = seo.defaultTitle;
  const description = seo.defaultDescription;
  const ogImage = seo.ogImage || defaultOgImagePath();

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: titleDefault,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    applicationName: siteConfig.name,
    alternates: { canonical: "/" },
    openGraph: {
      title: titleDefault,
      description,
      url: absoluteUrl("/"),
      locale: "th_TH",
      type: "website",
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          alt: siteConfig.name,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: [ogImage],
    },
    icons: {
      icon: [{ url: "/images/brand/logo-mark.png", type: "image/png" }],
      apple: [{ url: "/images/brand/logo-mark.png" }],
    },
    verification: {
      google: "IRQCJlJ1MvnD21nKRj4-owCJKpNRSny34TQQ2E_cXCk",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${sans.variable} ${display.variable} ${modern.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-ink antialiased">
        <Script id="changtee-theme" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
