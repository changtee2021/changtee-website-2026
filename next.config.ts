import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.googletagmanager.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
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
