import type { NextConfig } from "next";

function siteOriginForFrameSrc(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

const siteOrigin = siteOriginForFrameSrc();
const frameSrcExtra = siteOrigin ? ` ${siteOrigin}` : "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Framing controlled by CSP frame-ancestors only (middleware overrides for preview iframe).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.google.com https://www.google.co.th https://www.googleadservices.com https://googleads.g.doubleclick.net https://ad.doubleclick.net https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://challenges.cloudflare.com",
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

/** Editor shell must be able to iframe the public site (same or sibling origin). */
const editorFrameSrc = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.google.com https://www.google.co.th https://www.googleadservices.com https://googleads.g.doubleclick.net https://ad.doubleclick.net https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://challenges.cloudflare.com",
  `frame-src 'self'${frameSrcExtra} https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://challenges.cloudflare.com`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Hide Next.js / Turbopack dev toolbar (N badge) in local preview
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "erpzxusskbtdxvqadwxv.supabase.co",
      },
      {
        protocol: "https",
        hostname: "pfwygxzwlteqjnnwiwmb.supabase.co",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/admin/editor/:path*",
        headers: [
          { key: "Content-Security-Policy", value: editorFrameSrc },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/about", destination: "/contact", permanent: true },
      { source: "/estimate", destination: "/quote", permanent: true },
      { source: "/estimate/:path*", destination: "/quote", permanent: true },
      {
        source: "/admin/settings/estimator",
        destination: "/admin/settings",
        permanent: true,
      },
      {
        source: "/admin/settings/estimator/:path*",
        destination: "/admin/settings",
        permanent: true,
      },
      {
        source: "/products/venetian-blinds/panel",
        destination: "/products/venetian-blinds",
        permanent: true,
      },
      {
        source: "/sale-gallery",
        destination: "/",
        permanent: false,
      },
      // Legacy CMS (Mongo-style slug paths) — evidence in brand SERP Aug 2026
      {
        source: "/หน้าแรก/60ff6a36e68a7c5a4ca8c54e",
        destination: "/",
        permanent: true,
      },
      {
        source: "/หน้าแรก/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ผลงาน/610e26deafee180012845be9",
        destination: "/portfolio",
        permanent: true,
      },
      {
        source: "/ผลงาน/:path*",
        destination: "/portfolio",
        permanent: true,
      },
      {
        source: "/ผ้าม่านไฟฟ้า/68c0e9ae557b0b00135630b4",
        destination: "/products/motorized/curtain",
        permanent: true,
      },
      {
        source: "/ผ้าม่านไฟฟ้า/:path*",
        destination: "/products/motorized/curtain",
        permanent: true,
      },
      { source: "/ม่านญี่ปุ่น", destination: "/products/print-fabric/noren", permanent: true },
      { source: "/ม่านญี่ปุ่น/:path*", destination: "/products/print-fabric/noren", permanent: true },
      { source: "/ผ้าม่านญี่ปุ่น", destination: "/products/print-fabric/noren", permanent: true },
      { source: "/ผ้าม่านญี่ปุ่น/:path*", destination: "/products/print-fabric/noren", permanent: true },
      { source: "/ม่านพับ", destination: "/products/curtain/roman", permanent: true },
      { source: "/ม่านพับ/:path*", destination: "/products/curtain/roman", permanent: true },
      { source: "/ม่านม้วน", destination: "/products/roller-blinds", permanent: true },
      { source: "/ม่านม้วน/:path*", destination: "/products/roller-blinds", permanent: true },
      { source: "/มู่ลี่", destination: "/products/venetian-blinds", permanent: true },
      { source: "/มู่ลี่/:path*", destination: "/products/venetian-blinds", permanent: true },
      { source: "/ม่านปรับแสง", destination: "/products/vertical-blinds", permanent: true },
      { source: "/ม่านปรับแสง/:path*", destination: "/products/vertical-blinds", permanent: true },
      { source: "/ฉากกั้นห้อง", destination: "/products/pvc-partition", permanent: true },
      { source: "/ฉากกั้นห้อง/:path*", destination: "/products/pvc-partition", permanent: true },
      { source: "/ฉากกั้นแอร์", destination: "/products/pvc-partition", permanent: true },
      { source: "/ฉากกั้นแอร์/:path*", destination: "/products/pvc-partition", permanent: true },
      { source: "/ฉากกั้นห้องpvc", destination: "/products/pvc-partition", permanent: true },
      { source: "/ฉากกั้นห้องpvc/:path*", destination: "/products/pvc-partition", permanent: true },
      { source: "/ฉากกั้นแอร์pvc", destination: "/products/pvc-partition", permanent: true },
      { source: "/ฉากกั้นแอร์pvc/:path*", destination: "/products/pvc-partition", permanent: true },
      { source: "/วอลเปเปอร์", destination: "/products/surface/wallpaper", permanent: true },
      { source: "/วอลเปเปอร์/:path*", destination: "/products/surface/wallpaper", permanent: true },
      { source: "/ฟิล์มอาคาร", destination: "/products/surface/window-film", permanent: true },
      { source: "/ฟิล์มอาคาร/:path*", destination: "/products/surface/window-film", permanent: true },
      { source: "/ผ้าม่าน", destination: "/products/curtain", permanent: true },
      { source: "/ผ้าม่าน/:path*", destination: "/products/curtain", permanent: true },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.changtee-curtain.com" }],
        destination: "https://changtee-curtain.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "changtee-website-2026.vercel.app" }],
        destination: "https://changtee-curtain.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
