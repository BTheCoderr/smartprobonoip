import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/smartprobonoip",
        destination: "/",
        permanent: true,
      },
      {
        source: "/smartprobonoip/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/integrations",
        destination: "/for-professionals",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
