export const ROUTES = {
  home: "/",
  legal: "/legal",
  legalErmi: "/legal/ask-ermi",
  legalDraft: "/legal/draft",
  legalRecordClearing: "/legal/record-clearing",
  ip: "/ip",
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
  /** Inventor workspace. */
  workspace: "/workspace",
  /** Partner pilot metrics — unrelated to the inventor workspace. */
  dashboard: "/dashboard",
  /** Organization account inbox (Supabase Auth — org members only). */
  organization: "/organization",
  organizationLogin: "/organization/login",
  organizationMetrics: "/organization/metrics",
  organizationIntakes: "/organization/intakes",
  organizationReferral: (id: string) => `/organization/referrals/${id}`,
  leads: "/leads",
  recover: "/recover",
  contact: "/contact",
  about: "/about",
  afterMeeting: "/after-meeting",
  /** Protection-path entry points (SmartProBonoIP architecture) */
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

/**
 * Keep historical SmartProBonoIP URLs working while the umbrella platform
 * moves to the root and the IP product lives at /ip.
 */
export function normalizeAppPath(path: string): string {
  let normalized = path.startsWith("/") ? path : `/${path}`;

  while (normalized.startsWith("/smartprobonoip/smartprobonoip")) {
    normalized = normalized.replace("/smartprobonoip", "");
  }

  if (normalized === "/smartprobonoip") {
    return ROUTES.ip;
  }

  if (normalized.startsWith("/smartprobonoip/")) {
    normalized = normalized.slice("/smartprobonoip".length);
  }

  return normalized || "/";
}
