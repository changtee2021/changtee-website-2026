import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

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
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
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
    ];
  },
};

export default nextConfig;
