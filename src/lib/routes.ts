export const ROUTES = {
  home: "/",
  legacyHome: "/smartprobonoip",
  start: "/start",
  disclaimer: "/disclaimer",
  sample: "/sample",
  pilot: "/pilot",
  privacy: "/privacy",
  terms: "/terms",
  trust: "/trust",
  learn: "/learn",
  forProfessionals: "/for-professionals",
  forClinics: "/for/clinics",
  forUniversities: "/for/universities",
  dashboard: "/dashboard",
  leads: "/leads",
  recover: "/recover",
  contact: "/contact",
  about: "/about",
  afterMeeting: "/after-meeting",
  profile: (id: string) => `/profile/${id}`,
  profileResearch: (id: string) => `/profile/${id}/research`,
  disclaimerDemo: "/disclaimer?demo=1",
  startDemo: "/start?demo=1",
  dashboardDemo: "/dashboard?demo=1",
  sampleSimilarRef: "/sample#similar-reference-search-prep",
} as const;

/** Strip accidental /smartprobonoip prefix from route paths (not from URLs or slugs). */
export function normalizeAppPath(path: string): string {
  let normalized = path.startsWith("/") ? path : `/${path}`;

  while (normalized.startsWith("/smartprobonoip/smartprobonoip")) {
    normalized = normalized.replace("/smartprobonoip", "");
  }

  if (normalized === "/smartprobonoip") {
    return "/";
  }

  if (normalized.startsWith("/smartprobonoip/")) {
    normalized = normalized.slice("/smartprobonoip".length);
  }

  return normalized || "/";
}
