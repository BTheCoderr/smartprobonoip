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
}

export const DEFAULT_FILTERS: DashboardFilters = {
  signals: [],
  disclosureRisk: "all",
  resources: [],
  clarity: "all",
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

    return true;
  });
}
