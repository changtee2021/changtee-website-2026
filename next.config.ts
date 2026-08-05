import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide Next.js / Turbopack dev toolbar (N badge) in local preview
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "erpzxusskbtdxvqadwxv.supabase.co",
      },
    ],
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
