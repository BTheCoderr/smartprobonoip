"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { ROUTES } from "@/lib/routes";
import type { OrganizationMetricsSummary } from "@/lib/organization/types";

export function OrganizationMetricsView() {
  const [metrics, setMetrics] = useState<OrganizationMetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organization/metrics")
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = ROUTES.organizationLogin;
          return null;
        }
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setMetrics(data.metrics);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-navy-500">Loading metrics…</p>;
  }

  if (!metrics) {
    return <p className="text-sm text-navy-500">Metrics unavailable.</p>;
  }

  return (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardHeader
          title="Organization metrics"
          subtitle="Operational counts only — completed does not mean legal success."
        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Referrals received" value={metrics.referralsReceived} />
        <MetricCard
          label="Avg readiness score"
          value={metrics.averageReadinessScore ?? "—"}
        />
        <MetricCard label="Completed count" value={metrics.completedCount} />
        <MetricCard
          label="Avg hrs to first status update"
          value={metrics.averageTimeToFirstStatusUpdateHours ?? "—"}
        />
      </div>

      <Card>
        <CardHeader title="By status" />
        <ul className="space-y-2 text-sm">
          {Object.entries(metrics.byStatus).map(([key, count]) => (
            <li key={key} className="flex justify-between gap-3">
              <span className="text-navy-700">{key.replace(/_/g, " ")}</span>
              <span className="font-medium text-navy-900">{count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
