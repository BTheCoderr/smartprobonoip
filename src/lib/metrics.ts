import { normalizeProfileSignals, SIGNAL_KEYS } from "./signals";
import type {
  DashboardMetrics,
  ProjectRecord,
  ResourceCategory,
} from "./types";
import { withDefaultFollowUp } from "./records";

const RESOURCE_KEYS: ResourceCategory[] = [
  "education",
  "ptrc",
  "patent_pro_bono",
  "law_school_clinic",
  "patent_agent_attorney",
  "trademark_search",
  "copyright_registration",
  "business_accelerator",
];

function emptyCounts<T extends string>(keys: T[]): Record<T, number> {
  return keys.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<T, number>,
  );
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export function computeMetrics(records: ProjectRecord[]): DashboardMetrics {
  const signalCounts = emptyCounts(SIGNAL_KEYS);
  const referralCounts = emptyCounts(RESOURCE_KEYS);
  let publicDisclosureCount = 0;
  const preValues: number[] = [];
  const postValues: number[] = [];
  const deltas: number[] = [];
  let clarityImprovedCount = 0;
  const followUp = { day30: 0, day60: 0, day90: 0 };

  for (const raw of records) {
    const record = withDefaultFollowUp(raw);
    for (const signal of normalizeProfileSignals(
      record.profile.signals,
      record.answers,
    )) {
      signalCounts[signal] += 1;
    }
    for (const resource of record.profile.recommendedResources) {
      referralCounts[resource] += 1;
    }
    if (record.profile.publicDisclosure) publicDisclosureCount += 1;
    if (typeof record.preClarity === "number") preValues.push(record.preClarity);
    if (typeof record.postClarity === "number") {
      postValues.push(record.postClarity);
      const delta = record.postClarity - record.preClarity;
      deltas.push(delta);
      if (delta > 0) clarityImprovedCount += 1;
    }
    if (record.followUpStatus?.day30 === "done") followUp.day30 += 1;
    if (record.followUpStatus?.day60 === "done") followUp.day60 += 1;
    if (record.followUpStatus?.day90 === "done") followUp.day90 += 1;
  }

  return {
    totalIntakes: records.length,
    totalProfiles: records.filter((r) => r.profile).length,
    signalCounts,
    publicDisclosureCount,
    referralCounts,
    avgPreClarity: average(preValues),
    avgPostClarity: average(postValues),
    clarityResponses: postValues.length,
    clarityImprovedCount,
    avgClarityDelta: average(deltas),
    followUp,
  };
}

export function clarityDelta(record: ProjectRecord): number | null {
  if (typeof record.postClarity !== "number") return null;
  return record.postClarity - record.preClarity;
}
