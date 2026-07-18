import { normalizeAppPath } from "@/lib/routes";

const DEFAULT_APP_URL = "https://smartprobono.org";

function canonicalizeAppUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, "").replace(/\/smartprobonoip$/, "");
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    // Stale Netlify preview hostname must never win over the canonical domain.
    if (host.endsWith(".netlify.app") || host === "netlify.app") {
      return DEFAULT_APP_URL;
    }
  } catch {
    // Fall through and return the trimmed value when parsing fails.
  }
  return trimmed;
}

export function appBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? DEFAULT_APP_URL;

  return canonicalizeAppUrl(raw);
}

export function appPath(path: string): string {
  return `${appBaseUrl()}${normalizeAppPath(path)}`;
}
