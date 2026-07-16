import { normalizeAppPath } from "@/lib/routes";

const DEFAULT_APP_URL = "https://smartprobono.org";

export function appBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? DEFAULT_APP_URL;

  return raw.replace(/\/smartprobonoip$/, "");
}

export function appPath(path: string): string {
  return `${appBaseUrl()}${normalizeAppPath(path)}`;
}
