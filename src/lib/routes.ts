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
  partners: "/partners",
  partnerDetail: (id: string) => `/partners/${id}`,
  forProfessionals: "/for-professionals",
  playbook: "/for-professionals/playbook",
  pilotTracker: "/pilot-tracker",
  forClinics: "/for/clinics",
  forUniversities: "/for/universities",
  /** Inventor workspace. Returning inventors are redirected here from `/`. */
  workspace: "/workspace",
  /** Partner pilot metrics — unrelated to the inventor workspace. */
  dashboard: "/dashboard",
  /** Organization account inbox (Supabase Auth — org members only). */
  organization: "/organization",
  organizationLogin: "/organization/login",
  organizationMetrics: "/organization/metrics",
  organizationReferral: (id: string) => `/organization/referrals/${id}`,
  leads: "/leads",
  recover: "/recover",
  contact: "/contact",
  about: "/about",
  afterMeeting: "/after-meeting",
  /** Protection-path entry points (platform architecture) */
  protect: "/protect",
  protectPatent: "/protect/patent",
  protectTrademark: "/protect/trademark",
  protectCopyright: "/protect/copyright",
  protectTradeSecret: "/protect/trade-secret",
  protectUnsure: "/protect/unsure",
  profile: (id: string) => `/profile/${id}`,
  profileResearch: (id: string) => `/profile/${id}/research`,
  profileHandoff: (id: string, recommendationId: string) =>
    `/profile/${id}/handoff?rec=${encodeURIComponent(recommendationId)}`,
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
