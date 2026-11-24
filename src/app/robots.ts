import type { MetadataRoute } from "next";

/**
 * Static robots.txt. Previously missing, so every crawler request was
 * rendered by the server function as a 404 (and some timed out).
 * Private, per-user and API routes are disallowed; they also require a
 * session or token, so this is about crawl hygiene, not access control.
 */
export const PRIVATE_CRAWL_PREFIXES = [
  "/api/",
  "/profile/",
  "/recover",
  "/workspace",
  "/dashboard",
  "/leads",
  "/organization",
  "/pilot-tracker",
  "/sign-in",
  "/smartprobonoip/profile/",
  "/smartprobonoip/recover",
  "/smartprobonoip/dashboard",
];

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://smartprobono.org").replace(/\/+$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_CRAWL_PREFIXES }],
    host: base,
  };
}
