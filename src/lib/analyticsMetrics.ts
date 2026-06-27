import type { AnalyticsEventRow } from "@/lib/db/analytics";
import type { ProjectRecord } from "@/lib/types";
import { computeMetrics } from "./metrics";

export interface FunnelMetrics {
  landingViewed: number;
  startClicked: number;
  demoStarted: number;
  disclaimerAccepted: number;
  intakeStarted: number;
  intakeCompleted: number;
  packetGenerated: number;
  pdfDownloaded: number;
  recoveryLinkCreated: number;
}

export interface DropOffMetrics {
  lastCompletedStep: { step: number; count: number }[];
  validationErrors: { field: string; count: number }[];
}

export interface PartnerEventPerformance {
  partnerSlug: string;
  partnerName: string;
  packets: number;
  intakeCompleted: number;
  pdfDownloads: number;
  recoveryCreated: number;
}

export interface AnalyticsDashboardData {
  funnel: FunnelMetrics;
  dropOff: DropOffMetrics;
  partnerPerformance: PartnerEventPerformance[];
}

function countEvents(events: AnalyticsEventRow[], name: string): number {
  return events.filter((e) => e.event_name === name).length;
}

function partnerLabel(row: AnalyticsEventRow): string {
  return row.partner_name ?? row.partner_slug ?? "unattributed";
}

export function computeAnalyticsDashboard(
  events: AnalyticsEventRow[],
): AnalyticsDashboardData {
  const stepCounts = new Map<number, number>();
  const fieldErrors = new Map<string, number>();
  const partnerMap = new Map<
    string,
    {
      partnerName: string;
      intakeCompleted: number;
      pdfDownloads: number;
      recoveryCreated: number;
      packetGenerated: number;
    }
  >();

  for (const event of events) {
    if (event.event_name === "intake_step_completed") {
      const step = Number(event.metadata?.stepNumber ?? event.metadata?.step);
      if (Number.isFinite(step)) {
        stepCounts.set(step, (stepCounts.get(step) ?? 0) + 1);
      }
    }
    if (event.event_name === "intake_validation_error") {
      const field = String(
        event.metadata?.validationField ?? event.metadata?.field ?? "unknown",
      );
      fieldErrors.set(field, (fieldErrors.get(field) ?? 0) + 1);
    }

    const slug = event.partner_slug ?? "unattributed";
    const entry = partnerMap.get(slug) ?? {
      partnerName: slug === "unattributed" ? "Unattributed" : partnerLabel(event),
      intakeCompleted: 0,
      pdfDownloads: 0,
      recoveryCreated: 0,
      packetGenerated: 0,
    };
    if (event.event_name === "intake_completed") entry.intakeCompleted += 1;
    if (event.event_name === "pdf_downloaded") entry.pdfDownloads += 1;
    if (event.event_name === "recovery_link_created") entry.recoveryCreated += 1;
    if (event.event_name === "packet_generated") entry.packetGenerated += 1;
    partnerMap.set(slug, entry);
  }

  return {
    funnel: {
      landingViewed: countEvents(events, "landing_viewed"),
      startClicked: countEvents(events, "start_clicked"),
      demoStarted: countEvents(events, "demo_started"),
      disclaimerAccepted: countEvents(events, "disclaimer_accepted"),
      intakeStarted: countEvents(events, "intake_started"),
      intakeCompleted: countEvents(events, "intake_completed"),
      packetGenerated: countEvents(events, "packet_generated"),
      pdfDownloaded: countEvents(events, "pdf_downloaded"),
      recoveryLinkCreated: countEvents(events, "recovery_link_created"),
    },
    dropOff: {
      lastCompletedStep: [...stepCounts.entries()]
        .map(([step, count]) => ({ step, count }))
        .sort((a, b) => a.step - b.step),
      validationErrors: [...fieldErrors.entries()]
        .map(([field, count]) => ({ field, count }))
        .sort((a, b) => b.count - a.count),
    },
    partnerPerformance: [...partnerMap.entries()]
      .map(([partnerSlug, stats]) => ({
        partnerSlug,
        partnerName: stats.partnerName,
        packets: stats.packetGenerated,
        intakeCompleted: stats.intakeCompleted,
        pdfDownloads: stats.pdfDownloads,
        recoveryCreated: stats.recoveryCreated,
      }))
      .sort((a, b) => b.packets - a.packets),
  };
}

export function computePilotImpactFromRecords(records: ProjectRecord[]) {
  const metrics = computeMetrics(records);
  const strongReferral = records.filter((r) =>
    r.profile.recommendedResources.length >= 2,
  ).length;
  return {
    avgPreClarity: metrics.avgPreClarity,
    avgPostClarity: metrics.avgPostClarity,
    clarityLift: metrics.avgClarityDelta,
    strongReferralReadiness: strongReferral,
    topSignals: metrics.signalCounts,
  };
}
