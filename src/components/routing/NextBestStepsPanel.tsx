"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics/client";
import type { SupportNeed } from "@/lib/feedback";
import {
  buildNextBestStepPlanForRecord,
  getPartner,
  RECOMMENDATION_FEEDBACK_LABELS,
  requiresHandoffConfirmation,
  type NextBestStepPlan,
  type RecommendationFeedbackValue,
  type RoutingRecommendation,
} from "@/lib/routing";
import { ROUTES } from "@/lib/routes";
import { getStore } from "@/lib/store";
import type { ProjectRecord } from "@/lib/types";

const PANEL_COPY = {
  title: "Your next best steps",
  subtitle:
    "Based on the information you organized — starting points only, not legal advice.",
  safety:
    "These suggestions do not mean you qualify for any program or that filing is appropriate. Consider asking a partner or professional about options that may fit your situation.",
  viewAll: "View all resources",
  restoreDismissed: "Restore dismissed recommendations",
  whyRecommended: "Why this is recommended",
} as const;

function recommendationMetadata(
  rec: RoutingRecommendation,
  projectId: string,
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    recommendationId: rec.id,
    category: rec.category,
    projectId,
    ...(rec.partnerId ? { partnerId: rec.partnerId } : {}),
    ...extra,
  };
}

function RecommendationRow({
  rec,
  projectId,
  index,
  onDismiss,
  dismissed,
  submittedFeedback,
  onFeedback,
}: {
  rec: RoutingRecommendation;
  projectId: string;
  index?: number;
  onDismiss?: (id: string) => void;
  dismissed?: boolean;
  submittedFeedback?: RecommendationFeedbackValue | null;
  onFeedback?: (value: RecommendationFeedbackValue) => void;
}) {
  if (dismissed) return null;

  const partner = rec.partnerId ? getPartner(rec.partnerId) : undefined;
  const needsHandoff = requiresHandoffConfirmation(rec);
  const handoffHref = ROUTES.profileHandoff(projectId, rec.id);

  function handleActionClick() {
    trackEvent("recommendation_clicked", {
      projectId,
      metadata: recommendationMetadata(rec, projectId),
    });
  }

  const actionClass =
    "link-brand inline-flex items-center gap-1 text-sm font-semibold";

  return (
    <li
      className={`rounded-xl border p-4 ${
        rec.isUrgent
          ? "border-amber-300/80 bg-amber-50/50"
          : "border-mist-200/80 bg-white/90"
      }`}
    >
      <div className="flex gap-3">
        {typeof index === "number" ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
            {index + 1}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-navy-900">{rec.title}</h4>
            {rec.isUrgent ? (
              <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                Time-sensitive
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-navy-600">
            {rec.body}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-navy-500">
            <span className="font-semibold text-navy-600">
              {PANEL_COPY.whyRecommended}:
            </span>{" "}
            {rec.whyRecommended}
          </p>
          {partner?.disclaimer ? (
            <p className="mt-2 text-[11px] leading-relaxed text-navy-400">
              {partner.disclaimer}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {rec.action.href ? (
              needsHandoff ? (
                <Link
                  href={handoffHref}
                  className={actionClass}
                  onClick={handleActionClick}
                >
                  {rec.action.label} ↗
                </Link>
              ) : (
                <Link
                  href={rec.action.href}
                  className={actionClass}
                  onClick={handleActionClick}
                >
                  {rec.action.label} →
                </Link>
              )
            ) : null}
            {onDismiss ? (
              <button
                type="button"
                className="text-xs text-navy-400 underline-offset-2 hover:text-navy-600 hover:underline"
                onClick={() => {
                  trackEvent("recommendation_dismissed", {
                    projectId,
                    metadata: recommendationMetadata(rec, projectId),
                  });
                  onDismiss(rec.id);
                }}
              >
                Dismiss
              </button>
            ) : null}
          </div>
          {onFeedback ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-navy-400">Was this useful?</span>
              {(Object.keys(RECOMMENDATION_FEEDBACK_LABELS) as RecommendationFeedbackValue[]).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={submittedFeedback === value}
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      submittedFeedback === value
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-mist-200 text-navy-500 hover:border-teal-300 hover:text-teal-700"
                    }`}
                    onClick={() => onFeedback(value)}
                  >
                    {RECOMMENDATION_FEEDBACK_LABELS[value]}
                  </button>
                ),
              )}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function NextBestStepsPanel({
  record,
  savedReferenceCount = 0,
  supportNeeded = [],
  showViewAll = true,
  variant = "full",
  plan: planOverride,
}: {
  record: ProjectRecord;
  savedReferenceCount?: number;
  supportNeeded?: SupportNeed[];
  /** @deprecated Prefer `variant`. */
  showViewAll?: boolean;
  variant?: "full" | "primary" | "view_all";
  plan?: NextBestStepPlan;
}) {
  const resolvedVariant =
    variant === "full" && !showViewAll ? "primary" : variant;
  const includePrimary = resolvedVariant !== "view_all";
  const includeViewAll =
    resolvedVariant === "view_all" ||
    (resolvedVariant === "full" && showViewAll);
  const plan = useMemo(
    () =>
      planOverride ??
      buildNextBestStepPlanForRecord(record, savedReferenceCount, supportNeeded),
    [planOverride, record, savedReferenceCount, supportNeeded],
  );

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [feedbackByRec, setFeedbackByRec] = useState<
    Record<string, RecommendationFeedbackValue>
  >({});

  useEffect(() => {
    let active = true;
    getStore()
      .getRoutingPreferences(record.id)
      .then((preferences) => {
        if (!active) return;
        setDismissedIds(new Set(preferences.dismissedRecommendationIds));
        setPrefsLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setPrefsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [record.id]);

  const dismissRecommendation = useCallback(
    async (recommendationId: string) => {
      setDismissedIds((prev) => new Set([...prev, recommendationId]));
      try {
        const preferences = await getStore().dismissRecommendation(
          record.id,
          recommendationId,
        );
        setDismissedIds(new Set(preferences.dismissedRecommendationIds));
      } catch {
        // Optimistic UI already applied.
      }
    },
    [record.id],
  );

  const restoreAllDismissals = useCallback(async () => {
    try {
      const preferences = await getStore().restoreAllRecommendations(record.id);
      setDismissedIds(new Set(preferences.dismissedRecommendationIds));
      trackEvent("recommendation_dismissals_restored", {
        projectId: record.id,
        metadata: { restoredCount: dismissedIds.size },
      });
    } catch {
      setDismissedIds(new Set());
    }
  }, [dismissedIds.size, record.id]);

  const submitFeedback = useCallback(
    (rec: RoutingRecommendation, value: RecommendationFeedbackValue) => {
      setFeedbackByRec((prev) => ({ ...prev, [rec.id]: value }));
      trackEvent("recommendation_feedback_submitted", {
        projectId: record.id,
        metadata: recommendationMetadata(rec, record.id, {
          feedbackValue: value,
        }),
      });
    },
    [record.id],
  );

  useEffect(() => {
    if (!includePrimary || !prefsLoaded) return;
    for (const rec of plan.primary) {
      if (dismissedIds.has(rec.id)) continue;
      trackEvent("recommendation_shown", {
        projectId: record.id,
        metadata: recommendationMetadata(rec, record.id),
      });
    }
  }, [dismissedIds, includePrimary, plan.fingerprint, prefsLoaded, plan.primary, record.id]);

  const visiblePrimary = includePrimary
    ? plan.primary.filter((rec) => !dismissedIds.has(rec.id))
    : [];

  const dismissedCount = dismissedIds.size;

  if (
    visiblePrimary.length === 0 &&
    (!includeViewAll || plan.secondary.length === 0) &&
    dismissedCount === 0
  ) {
    return null;
  }

  const wrapperClass =
    resolvedVariant === "view_all"
      ? "border-mist-200/80 bg-white"
      : "border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-cream";

  return (
    <Card variant="elevated" className={wrapperClass}>
      {includePrimary ? (
        <>
          <CardHeader title={PANEL_COPY.title} subtitle={PANEL_COPY.subtitle} />
          <p className="text-sm leading-relaxed text-navy-600">
            {PANEL_COPY.safety}
          </p>
        </>
      ) : (
        <CardHeader
          title={PANEL_COPY.viewAll}
          subtitle="Additional verified resources and platform tools — starting points only."
        />
      )}

      {dismissedCount > 0 ? (
        <div className="mt-4">
          <button
            type="button"
            className="text-xs font-semibold text-teal-700 underline-offset-2 hover:underline"
            onClick={() => void restoreAllDismissals()}
          >
            {PANEL_COPY.restoreDismissed} ({dismissedCount})
          </button>
        </div>
      ) : null}

      {visiblePrimary.length > 0 ? (
        <ol className="mt-5 space-y-3">
          {visiblePrimary.map((rec, index) => (
            <RecommendationRow
              key={rec.id}
              rec={rec}
              projectId={record.id}
              index={index}
              dismissed={dismissedIds.has(rec.id)}
              onDismiss={(id) => void dismissRecommendation(id)}
              submittedFeedback={feedbackByRec[rec.id] ?? null}
              onFeedback={(value) => submitFeedback(rec, value)}
            />
          ))}
        </ol>
      ) : includePrimary && dismissedCount > 0 ? (
        <p className="mt-5 text-sm text-navy-500">
          All primary recommendations are dismissed. Restore them above or open
          additional resources below.
        </p>
      ) : null}

      {includeViewAll && plan.secondary.length > 0 ? (
        <details
          className={`${includePrimary ? "mt-6" : ""} rounded-xl border border-mist-200/80 bg-white/70`}
          open={viewAllOpen || resolvedVariant === "view_all"}
          onToggle={(event) => {
            setViewAllOpen((event.target as HTMLDetailsElement).open);
          }}
        >
          {includePrimary ? (
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-teal-700">
              {PANEL_COPY.viewAll}
            </summary>
          ) : null}
          <ul className="space-y-3 border-t border-mist-200/80 px-4 py-4">
            {plan.secondary
              .filter((rec) => !dismissedIds.has(rec.id))
              .map((rec) => (
                <RecommendationRow
                  key={rec.id}
                  rec={rec}
                  projectId={record.id}
                  onDismiss={(id) => void dismissRecommendation(id)}
                  dismissed={dismissedIds.has(rec.id)}
                  submittedFeedback={feedbackByRec[rec.id] ?? null}
                  onFeedback={(value) => submitFeedback(rec, value)}
                />
              ))}
          </ul>
        </details>
      ) : null}
    </Card>
  );
}
