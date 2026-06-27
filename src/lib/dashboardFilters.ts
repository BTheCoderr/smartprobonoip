import { clarityDelta } from "./metrics";
import type {
  ClarityFilter,
  IpSignal,
  ProjectRecord,
  ResourceCategory,
} from "./types";

export interface DashboardFilters {
  signals: IpSignal[];
  disclosureRisk: "all" | "yes" | "no";
  resources: ResourceCategory[];
  clarity: ClarityFilter;
  partner: string;
  source: string;
  campaign: string;
  demoMode: "all" | "live" | "demo";
  dateFrom: string;
  dateTo: string;
}

export const DEFAULT_FILTERS: DashboardFilters = {
  signals: [],
  disclosureRisk: "all",
  resources: [],
  clarity: "all",
  partner: "all",
  source: "all",
  campaign: "all",
  demoMode: "all",
  dateFrom: "",
  dateTo: "",
};

export function filterRecords(
  records: ProjectRecord[],
  filters: DashboardFilters,
): ProjectRecord[] {
  return records.filter((record) => {
    if (
      filters.signals.length > 0 &&
      !filters.signals.some((s) => record.profile.signals.includes(s))
    ) {
      return false;
    }

    if (filters.disclosureRisk === "yes" && !record.profile.publicDisclosure) {
      return false;
    }
    if (filters.disclosureRisk === "no" && record.profile.publicDisclosure) {
      return false;
    }

    if (
      filters.resources.length > 0 &&
      !filters.resources.some((r) =>
        record.profile.recommendedResources.includes(r),
      )
    ) {
      return false;
    }

    const delta = clarityDelta(record);
    if (filters.clarity === "improved" && !(typeof delta === "number" && delta > 0)) {
      return false;
    }
    if (filters.clarity === "same" && !(typeof delta === "number" && delta === 0)) {
      return false;
    }
    if (filters.clarity === "declined" && !(typeof delta === "number" && delta < 0)) {
      return false;
    }
    if (filters.clarity === "no_response" && record.postClarity !== null) {
      return false;
    }

    if (filters.partner !== "all") {
      if (filters.partner === "unattributed") {
        if (record.partnerSlug) return false;
      } else if (record.partnerSlug !== filters.partner) {
        return false;
      }
    }

    if (filters.source !== "all" && record.source !== filters.source) {
      return false;
    }

    if (filters.campaign !== "all" && record.campaign !== filters.campaign) {
      return false;
    }

    if (filters.demoMode === "live" && record.isDemo) return false;
    if (filters.demoMode === "demo" && !record.isDemo) return false;

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(record.createdAt) < from) return false;
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(record.createdAt) > to) return false;
    }

    return true;
  });
}
