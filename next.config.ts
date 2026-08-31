import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "cclyiv24gj3eaume.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;