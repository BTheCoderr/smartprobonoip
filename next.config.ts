import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/smartprobonoip/:path*", destination: "/:path*" },
    ];
  },
  async redirects() {
    return [
      {
        source: "/integrations",
        destination: "/for-professionals",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
