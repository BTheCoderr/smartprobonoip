import { SUPPORT_NEED_OPTIONS, type PilotFeedbackRecord } from "@/lib/feedback";
import { PARTNER_CATALOG } from "@/lib/partnerTracking";

export interface FeedbackMetrics {
  submittedCount: number;
  clarityHelpedYesPercent: number | null;
  wouldBringYesPercent: number | null;
  followUpRequestedCount: number;
  topSupportNeeds: { label: string; count: number }[];
  supportNeedsByPartner: {
    partnerSlug: string;
    partnerName: string;
    needs: { label: string; count: number }[];
  }[];
}

function percentYes(values: (string | null | undefined)[]): number | null {
  const answered = values.filter(Boolean);
  if (answered.length === 0) return null;
  const yes = answered.filter((value) => value === "yes").length;
  return Math.round((yes / answered.length) * 100);
}

export function computeFeedbackMetrics(
  feedback: PilotFeedbackRecord[],
): FeedbackMetrics {
  const needCounts = new Map<string, number>();
  const partnerNeeds = new Map<string, Map<string, number>>();

  for (const row of feedback) {
    for (const need of row.supportNeeded) {
      needCounts.set(need, (needCounts.get(need) ?? 0) + 1);
      const slug = row.partnerSlug ?? "unattributed";
      const partnerMap = partnerNeeds.get(slug) ?? new Map<string, number>();
      partnerMap.set(need, (partnerMap.get(need) ?? 0) + 1);
      partnerNeeds.set(slug, partnerMap);
    }
  }

  const topSupportNeeds = [...needCounts.entries()]
    .map(([need, count]) => ({
      label:
        SUPPORT_NEED_OPTIONS.find((option) => option.value === need)?.label ??
        need,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const supportNeedsByPartner = [...partnerNeeds.entries()]
    .map(([partnerSlug, needs]) => ({
      partnerSlug,
      partnerName:
        partnerSlug === "unattributed"
          ? "Unattributed"
          : (PARTNER_CATALOG[partnerSlug] ?? partnerSlug),
      needs: [...needs.entries()]
        .map(([need, count]) => ({
          label:
            SUPPORT_NEED_OPTIONS.find((option) => option.value === need)
              ?.label ?? need,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4),
    }))
    .sort((a, b) => {
      const totalA = a.needs.reduce((sum, item) => sum + item.count, 0);
      const totalB = b.needs.reduce((sum, item) => sum + item.count, 0);
      return totalB - totalA;
    });

  return {
    submittedCount: feedback.length,
    clarityHelpedYesPercent: percentYes(feedback.map((row) => row.clarityHelped)),
    wouldBringYesPercent: percentYes(
      feedback.map((row) => row.wouldBringToExpert),
    ),
    followUpRequestedCount: feedback.filter((row) => row.followUpRequested)
      .length,
    topSupportNeeds,
    supportNeedsByPartner,
  };
}
