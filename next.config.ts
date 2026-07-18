import type { NextConfig } from "next";
import { HSTS_HEADER, SECURITY_HEADERS } from "./src/lib/security/headers";

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...Object.entries(SECURITY_HEADERS).map(([key, value]) => ({
            key,
            value,
          })),
          { key: "Strict-Transport-Security", value: HSTS_HEADER },
        ],
      },
    ];
  },
};

export default nextConfig;
