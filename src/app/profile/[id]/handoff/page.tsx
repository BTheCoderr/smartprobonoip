"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RecommendationHandoffScreen } from "@/components/routing/RecommendationHandoffScreen";
import { Card } from "@/components/ui/Card";
import { buildNextBestStepPlanForRecord } from "@/lib/routing";
import { getStore } from "@/lib/store";
import { ROUTES } from "@/lib/routes";
import type { ProjectRecord } from "@/lib/types";

export default function RecommendationHandoffPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rec?: string }>;
}) {
  const { id } = use(params);
  const { rec: recommendationId } = use(searchParams);
  const [record, setRecord] = useState<ProjectRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getStore()
      .getRecord(id)
      .then((loaded) => {
        if (!active) return;
        setRecord(loaded);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const recommendation = useMemo(() => {
    if (!record || !recommendationId) return null;
    const plan = buildNextBestStepPlanForRecord(record, 0);
    return (
      [...plan.primary, ...plan.secondary].find(
        (item) => item.id === recommendationId,
      ) ?? null
    );
  }, [record, recommendationId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-navy-500">Loading handoff…</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card variant="elevated">
          <p className="text-sm text-navy-600">Packet not found.</p>
          <Link href={ROUTES.workspace} className="link-brand mt-3 inline-block text-sm">
            Go to workspace →
          </Link>
        </Card>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card variant="elevated">
          <p className="text-sm text-navy-600">
            Recommendation not found. It may have changed since your last visit.
          </p>
          <Link
            href={ROUTES.profile(id)}
            className="link-brand mt-3 inline-block text-sm"
          >
            Back to packet →
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <RecommendationHandoffScreen
        projectId={id}
        recommendation={recommendation}
      />
    </div>
  );
}
