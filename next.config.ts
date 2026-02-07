import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    'preview-hjmfjdaermhp.share.sandbox.dev'
  ],
};

export default nextConfig;
