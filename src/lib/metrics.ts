import type {
  DashboardMetrics,
  IpSignal,
  ProjectRecord,
  ResourceCategory,
} from "./types";

const SIGNAL_KEYS: IpSignal[] = [
  "patent_invention",
  "trademark_brand",
  "copyright_creative_software",
  "trade_secret",
  "nda_business_support",
  "expert_review",
];

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

  for (const record of records) {
    for (const signal of record.profile.signals) {
      signalCounts[signal] += 1;
    }
    for (const resource of record.profile.recommendedResources) {
      referralCounts[resource] += 1;
    }
    if (record.profile.publicDisclosure) publicDisclosureCount += 1;
    if (typeof record.preClarity === "number") preValues.push(record.preClarity);
    if (typeof record.postClarity === "number") postValues.push(record.postClarity);
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
    followUp: { day30: 0, day60: 0, day90: 0 },
  };
}
