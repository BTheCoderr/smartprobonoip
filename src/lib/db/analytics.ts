import "server-only";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/metadata";
import { getSupabaseService } from "@/lib/supabaseServer";

export interface AnalyticsEventRow {
  id: string;
  event_name: string;
  project_id: string | null;
  pilot_session_id: string | null;
  anonymous_id: string | null;
  partner_slug: string | null;
  partner_name: string | null;
  source: string | null;
  campaign: string | null;
  route: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsEventInput {
  eventName: string;
  projectId?: string | null;
  pilotSessionId?: string | null;
  anonymousId?: string | null;
  partnerSlug?: string | null;
  partnerName?: string | null;
  source?: string | null;
  campaign?: string | null;
  route?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsQueryFilters {
  partner?: string;
  source?: string;
  campaign?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function insertAnalyticsEvent(
  input: AnalyticsEventInput,
): Promise<void> {
  const sb = getSupabaseService();
  const metadata = sanitizeAnalyticsMetadata(input.metadata);
  const { error } = await sb.from("smartprobonoip_analytics_events").insert({
    event_name: input.eventName,
    project_id: input.projectId ?? null,
    pilot_session_id: input.pilotSessionId ?? null,
    anonymous_id: input.anonymousId ?? null,
    partner_slug: input.partnerSlug ?? null,
    partner_name: input.partnerName ?? null,
    source: input.source ?? null,
    campaign: input.campaign ?? null,
    route: input.route ?? null,
    metadata,
  });
  if (error) throw new Error(error.message);
}

export async function listAnalyticsEvents(
  filters: AnalyticsQueryFilters = {},
): Promise<AnalyticsEventRow[]> {
  const sb = getSupabaseService();
  let query = sb
    .from("smartprobonoip_analytics_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (filters.partner && filters.partner !== "all") {
    if (filters.partner === "unattributed") {
      query = query.is("partner_slug", null);
    } else {
      query = query.eq("partner_slug", filters.partner);
    }
  }
  if (filters.source && filters.source !== "all") {
    query = query.eq("source", filters.source);
  }
  if (filters.campaign && filters.campaign !== "all") {
    query = query.eq("campaign", filters.campaign);
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    query = query.lte("created_at", to.toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as AnalyticsEventRow[];
}

export async function getProjectEventFlags(
  projectIds: string[],
): Promise<Map<string, { pdfDownloaded: boolean; recoveryCreated: boolean }>> {
  const flags = new Map<string, { pdfDownloaded: boolean; recoveryCreated: boolean }>();
  if (projectIds.length === 0) return flags;

  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_analytics_events")
    .select("project_id, event_name")
    .in("project_id", projectIds)
    .in("event_name", ["pdf_downloaded", "recovery_link_created"]);

  if (error || !data) return flags;

  for (const row of data) {
    const id = row.project_id as string | null;
    if (!id) continue;
    const current = flags.get(id) ?? {
      pdfDownloaded: false,
      recoveryCreated: false,
    };
    if (row.event_name === "pdf_downloaded") current.pdfDownloaded = true;
    if (row.event_name === "recovery_link_created") current.recoveryCreated = true;
    flags.set(id, current);
  }
  return flags;
}
