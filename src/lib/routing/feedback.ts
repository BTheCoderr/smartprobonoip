export const RECOMMENDATION_FEEDBACK_VALUES = [
  "helpful",
  "not_relevant",
  "already_handled",
] as const;

export type RecommendationFeedbackValue =
  (typeof RECOMMENDATION_FEEDBACK_VALUES)[number];

export function isRecommendationFeedbackValue(
  value: string,
): value is RecommendationFeedbackValue {
  return (RECOMMENDATION_FEEDBACK_VALUES as readonly string[]).includes(value);
}

export const RECOMMENDATION_FEEDBACK_LABELS: Record<
  RecommendationFeedbackValue,
  string
> = {
  helpful: "Helpful",
  not_relevant: "Not relevant",
  already_handled: "Already handled",
};
