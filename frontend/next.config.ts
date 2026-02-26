import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker multi-stage build
  images: {
    remotePatterns: [
      {
        // Internal: backend-side image processing within Docker network
        protocol: "http",
        hostname: "minio",
        port: "9000",
      },
      {
        // Public: CDN subdomain for serving images to users
        protocol: "https",
        hostname: "cdn.yotop10.com",
      },
      {
        protocol: "https",
        hostname: "yotop10.com",
      },
    ],
  },
};

export default nextConfig;
