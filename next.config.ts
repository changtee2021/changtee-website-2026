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
};

export default nextConfig;
