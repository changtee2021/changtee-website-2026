import type { Metadata, Viewport } from "next";
import { Bai_Jamjuree, IBM_Plex_Sans_Thai } from "next/font/google";
import { loadSeoDefaults } from "@/lib/seo/seo-defaults";
import { absoluteUrl, defaultOgImagePath } from "@/lib/seo/meta";
import { siteConfig } from "@/lib/site-config";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const sans = IBM_Plex_Sans_Thai({
  variable: "--font-body",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Bai_Jamjuree({
  variable: "--font-display-family",
  subsets: ["thai", "latin"],
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
      images: [{ url: ogImage, alt: siteConfig.name }],
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
  };
}

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${sans.variable} ${display.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
