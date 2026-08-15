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
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://challenges.cloudflare.com",
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
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com https://challenges.cloudflare.com",
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
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.changtee-curtain.com" }],
        destination: "https://changtee-curtain.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
