import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/smartprobonoip",
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
