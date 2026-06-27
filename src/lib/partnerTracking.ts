export interface PilotTracking {
  partnerSlug?: string;
  partnerName?: string;
  source?: string;
  campaign?: string;
}

export const PARTNER_CATALOG: Record<string, string> = {
  rihub: "RIHub",
  communityip: "Community IP",
  seg: "SEG",
  "smartprobonoip-ri-pilot": "SmartProBonoIP Rhode Island Pilot",
};

const STORAGE_KEY = "smartprobonoip:pilot-tracking";

export function resolvePartnerName(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  return PARTNER_CATALOG[slug] ?? slug;
}

export function parseTrackingFromSearch(
  search: string,
): PilotTracking | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const partnerSlug = params.get("partner")?.trim() || undefined;
  const source = params.get("source")?.trim() || undefined;
  const campaign = params.get("campaign")?.trim() || undefined;

  if (!partnerSlug && !source && !campaign) return null;

  return {
    partnerSlug,
    partnerName: resolvePartnerName(partnerSlug),
    source,
    campaign,
  };
}

export function getStoredTracking(): PilotTracking | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PilotTracking;
  } catch {
    return null;
  }
}

export function setStoredTracking(tracking: PilotTracking): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracking));
}

export function mergeTracking(
  current: PilotTracking | null,
  incoming: PilotTracking | null,
): PilotTracking | null {
  if (!incoming) return current;
  const merged: PilotTracking = { ...(current ?? {}), ...incoming };
  if (incoming.partnerSlug) {
    merged.partnerName = resolvePartnerName(incoming.partnerSlug);
  }
  const hasValue = Boolean(
    merged.partnerSlug || merged.source || merged.campaign,
  );
  return hasValue ? merged : null;
}

export function captureTrackingFromSearch(search: string): PilotTracking | null {
  const incoming = parseTrackingFromSearch(search);
  if (!incoming) return getStoredTracking();
  const merged = mergeTracking(getStoredTracking(), incoming);
  if (merged) setStoredTracking(merged);
  return merged;
}

export function getPilotSourceLabel(
  record:
    | PilotTracking
    | { partnerSlug?: string | null; partnerName?: string | null }
    | null
    | undefined,
): string | null {
  if (!record) return null;
  if (record.partnerName) return record.partnerName;
  if (record.partnerSlug) {
    return resolvePartnerName(record.partnerSlug) ?? record.partnerSlug;
  }
  return null;
}

export function appendTrackingQuery(
  path: string,
  tracking: Record<string, string | undefined>,
): string {
  const [base, existingQuery] = path.split("?");
  const params = new URLSearchParams(existingQuery ?? "");
  for (const [key, value] of Object.entries(tracking)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export const PARTNER_SLUG_OPTIONS = Object.keys(PARTNER_CATALOG);
