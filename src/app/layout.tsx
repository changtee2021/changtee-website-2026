import type { Metadata } from "next";
import { Be_Vietnam_Pro, Sarabun } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const sans = Sarabun({
  variable: "--font-body",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Be_Vietnam_Pro({
  variable: "--font-display-family",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    locale: "th_TH",
    type: "website",
    siteName: siteConfig.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sans.variable} ${display.variable} h-full overflow-x-clip`}>
      <body className="min-h-full overflow-x-clip bg-white text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
