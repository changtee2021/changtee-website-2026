import type { Metadata, Viewport } from "next";
import { Bai_Jamjuree, IBM_Plex_Sans_Thai } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    locale: "th_TH",
    type: "website",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: [{ url: "/images/brand/logo-mark.png", type: "image/png" }],
    apple: [{ url: "/images/brand/logo-mark.png" }],
  },
};

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
    <html lang="th" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="min-h-full bg-white text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
