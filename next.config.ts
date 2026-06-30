import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
