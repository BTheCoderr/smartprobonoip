export interface RoutingPreferences {
  dismissedRecommendationIds: string[];
}

export const EMPTY_ROUTING_PREFERENCES: RoutingPreferences = {
  dismissedRecommendationIds: [],
};

export function normalizeRoutingPreferences(
  input: unknown,
): RoutingPreferences {
  if (!input || typeof input !== "object") {
    return { ...EMPTY_ROUTING_PREFERENCES };
  }
  const raw = input as { dismissedRecommendationIds?: unknown };
  const ids = Array.isArray(raw.dismissedRecommendationIds)
    ? raw.dismissedRecommendationIds.filter(
        (id): id is string => typeof id === "string" && id.trim().length > 0,
      )
    : [];
  return { dismissedRecommendationIds: [...new Set(ids)] };
}

export function dismissRecommendationId(
  prefs: RoutingPreferences,
  recommendationId: string,
): RoutingPreferences {
  if (prefs.dismissedRecommendationIds.includes(recommendationId)) {
    return prefs;
  }
  return {
    dismissedRecommendationIds: [
      ...prefs.dismissedRecommendationIds,
      recommendationId,
    ],
  };
}

export function restoreRecommendationId(
  prefs: RoutingPreferences,
  recommendationId: string,
): RoutingPreferences {
  return {
    dismissedRecommendationIds: prefs.dismissedRecommendationIds.filter(
      (id) => id !== recommendationId,
    ),
  };
}

export function restoreAllDismissals(): RoutingPreferences {
  return { ...EMPTY_ROUTING_PREFERENCES };
}
