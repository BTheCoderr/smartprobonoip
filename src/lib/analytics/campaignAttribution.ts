export interface CampaignAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
}

const STORAGE_KEY = "smartprobonoip:campaign-attribution";

function readRaw(): CampaignAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CampaignAttribution;
  } catch {
    return null;
  }
}

function writeRaw(value: CampaignAttribution): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function captureCampaignAttribution(search: string): CampaignAttribution | null {
  if (typeof window === "undefined") return null;

  const existing = readRaw();
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  const incoming: CampaignAttribution = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const) {
    const value = params.get(key)?.trim();
    if (value) incoming[key] = value.slice(0, 120);
  }

  const hasIncoming = Object.keys(incoming).length > 0;
  if (!existing && !hasIncoming) {
    const firstTouch: CampaignAttribution = {
      referrer: document.referrer?.slice(0, 200) || undefined,
      landing_page: window.location.pathname.slice(0, 200),
    };
    if (firstTouch.referrer || firstTouch.landing_page) {
      writeRaw(firstTouch);
      return firstTouch;
    }
    return null;
  }

  if (!existing) {
    const merged: CampaignAttribution = {
      ...incoming,
      referrer: document.referrer?.slice(0, 200) || undefined,
      landing_page: window.location.pathname.slice(0, 200),
    };
    writeRaw(merged);
    return merged;
  }

  if (hasIncoming) {
    const merged = { ...existing, ...incoming };
    writeRaw(merged);
    return merged;
  }

  return existing;
}

export function getCampaignAttribution(): CampaignAttribution | null {
  return readRaw();
}

export function campaignAttributionParams(): Record<string, string> {
  const attr = getCampaignAttribution();
  if (!attr) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(attr)) {
    if (typeof value === "string" && value.trim()) {
      out[key] = value.trim().slice(0, 120);
    }
  }
  return out;
}
