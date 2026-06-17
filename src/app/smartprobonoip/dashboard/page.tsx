"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getBackendName, getStore } from "@/lib/store";
import { computeMetrics } from "@/lib/metrics";
import { RESOURCE_LABELS, SIGNAL_LABELS } from "@/lib/labels";
import type {
  DashboardMetrics,
  IpSignal,
  ResourceCategory,
} from "@/lib/types";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-sm text-navy-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-navy-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-navy-400">{hint}</p> : null}
    </Card>
  );
}

function BarList({
  title,
  entries,
  total,
}: {
  title: string;
  entries: { label: string; value: number }[];
  total: number;
}) {
  const ranked = [...entries]
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value);
  return (
    <Card>
      <CardHeader title={title} />
      {ranked.length === 0 ? (
        <p className="text-sm text-navy-400">No data yet.</p>
      ) : (
        <ul className="space-y-3">
          {ranked.map((e) => (
            <li key={e.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-700">{e.label}</span>
                <span className="font-medium text-navy-900">{e.value}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-mist-200">
                <div
                  className="h-full rounded-full bg-teal-500"
                  style={{
                    width: `${total > 0 ? Math.round((e.value / total) * 100) : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const backend = getBackendName();

  useEffect(() => {
    getStore()
      .listRecords()
      .then((records) => setMetrics(computeMetrics(records)));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">
            Partner dashboard
          </h1>
          <p className="mt-1 text-navy-500">
            Readiness and impact metrics across intakes.
          </p>
        </div>
        <Badge tone={backend === "supabase" ? "teal" : "gray"}>
          Data source: {backend === "supabase" ? "Supabase" : "Local device"}
        </Badge>
      </div>

      {!metrics ? (
        <Card className="mt-8">
          <p className="text-sm text-navy-500">Loading metrics…</p>
        </Card>
      ) : metrics.totalIntakes === 0 ? (
        <Card className="mt-8">
          <p className="text-sm text-navy-600">
            No intakes recorded yet. Complete a readiness check to populate the
            dashboard.
          </p>
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total intakes completed"
              value={metrics.totalIntakes}
            />
            <StatCard
              label="Profiles generated"
              value={metrics.totalProfiles}
            />
            <StatCard
              label="Users with public sharing risk"
              value={metrics.publicDisclosureCount}
              hint="Flagged possible public disclosure"
            />
            <StatCard
              label="Avg. clarity (pre → post)"
              value={`${metrics.avgPreClarity ?? "—"} → ${
                metrics.avgPostClarity ?? "—"
              }`}
              hint={`${metrics.clarityResponses} post-profile responses`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <BarList
              title="Most common IP category signals"
              total={metrics.totalProfiles}
              entries={(
                Object.entries(metrics.signalCounts) as [IpSignal, number][]
              ).map(([k, v]) => ({ label: SIGNAL_LABELS[k], value: v }))}
            />
            <BarList
              title="Referrals by resource type"
              total={metrics.totalProfiles}
              entries={(
                Object.entries(metrics.referralCounts) as [
                  ResourceCategory,
                  number,
                ][]
              ).map(([k, v]) => ({ label: RESOURCE_LABELS[k], value: v }))}
            />
          </div>

          <Card>
            <CardHeader
              title="Follow-up status (30 / 60 / 90 day)"
              subtitle="Placeholder for partner follow-up tracking."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "30-day", value: metrics.followUp.day30 },
                { label: "60-day", value: metrics.followUp.day60 },
                { label: "90-day", value: metrics.followUp.day90 },
              ].map((f) => (
                <div
                  key={f.label}
                  className="rounded-lg border border-dashed border-mist-300 bg-mist-50 p-4"
                >
                  <p className="text-sm text-navy-500">{f.label} check-in</p>
                  <p className="mt-1 text-2xl font-bold text-navy-900">
                    {f.value}
                  </p>
                  <p className="text-xs text-navy-400">completed</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
