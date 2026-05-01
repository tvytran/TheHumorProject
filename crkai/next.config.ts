import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.almostcrackd.ai",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
