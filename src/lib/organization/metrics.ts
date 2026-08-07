import type {
  OrganizationMetricsSummary,
  OrganizationReferralRecord,
  OrganizationReferralStatus,
} from "./types";
import { ORGANIZATION_REFERRAL_STATUSES } from "./types";

function emptyStatusCounts(): Record<OrganizationReferralStatus, number> {
  return ORGANIZATION_REFERRAL_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<OrganizationReferralStatus, number>,
  );
}

export function computeOrganizationMetrics(
  referrals: OrganizationReferralRecord[],
): OrganizationMetricsSummary {
  const byStatus = emptyStatusCounts();
  let readinessTotal = 0;
  let readinessCount = 0;
  let firstStatusTotalHours = 0;
  let firstStatusCount = 0;

  for (const referral of referrals) {
    byStatus[referral.status] += 1;
    const score = referral.sharedSnapshot.readiness?.overallScore;
    if (typeof score === "number") {
      readinessTotal += score;
      readinessCount += 1;
    }

    if (referral.firstStatusAt) {
      const created = Date.parse(referral.createdAt);
      const first = Date.parse(referral.firstStatusAt);
      if (Number.isFinite(created) && Number.isFinite(first) && first >= created) {
        firstStatusTotalHours += (first - created) / (1000 * 60 * 60);
        firstStatusCount += 1;
      }
    }
  }

  return {
    referralsReceived: referrals.length,
    byStatus,
    averageReadinessScore:
      readinessCount > 0 ? Math.round(readinessTotal / readinessCount) : null,
    averageTimeToFirstStatusUpdateHours:
      firstStatusCount > 0
        ? Math.round((firstStatusTotalHours / firstStatusCount) * 10) / 10
        : null,
    completedCount: byStatus.completed,
  };
}
