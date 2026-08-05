import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Workers has no Image Optimization API; serve public assets as-is.
    unoptimized: true,
  },
};

export default nextConfig;
