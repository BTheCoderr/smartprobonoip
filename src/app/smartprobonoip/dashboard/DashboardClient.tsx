"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DemoChecklist } from "@/components/DemoChecklist";
import { DEFAULT_FILTERS, filterRecords } from "@/lib/dashboardFilters";
import { mergeWithDemoRecords } from "@/lib/demo";
import { clarityDelta, computeMetrics } from "@/lib/metrics";
import { SIGNAL_LABELS, RESOURCE_LABELS } from "@/lib/labels";
import { getBackendName, getStore } from "@/lib/store";
import { isApiStoreAvailable } from "@/lib/store/api";
import {
  getPartnerSecret,
  partnerSecretHeaders,
  setPartnerSecret,
} from "@/lib/pilotSession";
import type {
  ClarityFilter,
  DashboardMetrics,
  IpSignal,
  ProjectRecord,
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

const SIGNAL_KEYS = Object.keys(SIGNAL_LABELS) as IpSignal[];
const RESOURCE_KEYS = Object.keys(RESOURCE_LABELS) as ResourceCategory[];

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const backend = getBackendName();
  const [records, setRecords] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(searchParams.get("demo") === "1");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [partnerSecret, setPartnerSecretState] = useState("");
  const [secretSaved, setSecretSaved] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        if (isApiStoreAvailable()) {
          const secret = getPartnerSecret();
          if (secret) {
            const res = await fetch("/api/partner/metrics", {
              headers: partnerSecretHeaders(secret),
            });
            if (res.ok) {
              const data = (await res.json()) as { records: ProjectRecord[] };
              if (active) {
                setRecords(data.records);
                setLoading(false);
                return;
              }
            }
          }
          if (active) setRecords([]);
        } else {
          const local = await getStore().listRecords();
          if (active) setRecords(local.filter((r) => !r.isDemo));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [secretSaved]);

  const liveCount = records.filter((r) => !r.isDemo).length;
  const includeDemo = showDemo || (!loading && liveCount === 0);

  const displayRecords = useMemo(
    () => mergeWithDemoRecords(records, includeDemo),
    [records, includeDemo],
  );
  const filteredRecords = useMemo(
    () => filterRecords(displayRecords, filters),
    [displayRecords, filters],
  );
  const metrics: DashboardMetrics | null = loading
    ? null
    : computeMetrics(filteredRecords);

  function toggleSignal(signal: IpSignal) {
    setFilters((prev) => ({
      ...prev,
      signals: prev.signals.includes(signal)
        ? prev.signals.filter((s) => s !== signal)
        : [...prev.signals, signal],
    }));
  }

  function toggleResource(resource: ResourceCategory) {
    setFilters((prev) => ({
      ...prev,
      resources: prev.resources.includes(resource)
        ? prev.resources.filter((r) => r !== resource)
        : [...prev.resources, resource],
    }));
  }

  function savePartnerSecret() {
    if (partnerSecret.trim()) {
      setPartnerSecret(partnerSecret.trim());
      setSecretSaved((v) => !v);
    }
  }

  async function exportCsv() {
    const secret = getPartnerSecret() ?? partnerSecret;
    if (!secret) {
      alert("Enter the partner dashboard secret to export pilot CSV.");
      return;
    }
    const res = await fetch(
      `/api/partner/export.csv?secret=${encodeURIComponent(secret)}`,
    );
    if (!res.ok) {
      alert("Export failed. Check your partner secret.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smartprobonoip-pilot-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Partner dashboard</h1>
          <p className="mt-1 text-navy-500">
            Readiness and impact metrics across intakes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={includeDemo ? "teal" : "gray"}>
            {includeDemo ? "Demo data" : "Live pilot data"}
          </Badge>
          <Badge tone={backend === "supabase" ? "teal" : "gray"}>
            Data source: {backend === "supabase" ? "Supabase" : "Local device"}
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-mist-200 bg-white px-4 py-3 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={showDemo}
            onChange={(e) => setShowDemo(e.target.checked)}
            className="h-4 w-4 accent-teal-600"
          />
          Show demo data (for partner presentations)
        </label>
        <Link
          href="/smartprobonoip/disclaimer?demo=1"
          className="inline-flex items-center justify-center rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 transition hover:bg-teal-100"
        >
          Try demo intake →
        </Link>
      </div>

      <div className="mt-6">
        <DemoChecklist />
      </div>

      {isApiStoreAvailable() ? (
        <Card className="mt-6">
          <CardHeader
            title="Partner access"
            subtitle="Required to load live Supabase pilot data and export CSV."
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="password"
              value={partnerSecret}
              onChange={(e) => setPartnerSecretState(e.target.value)}
              placeholder="Partner dashboard secret"
              className="min-w-[220px] flex-1 rounded-lg border border-mist-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={savePartnerSecret}
              className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
            >
              Unlock live data
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-lg border border-mist-300 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-mist-100"
            >
              Export pilot CSV
            </button>
          </div>
        </Card>
      ) : (
        <Card className="mt-6">
          <p className="text-sm text-navy-600">
            Running in local mode. Complete an intake or enable demo data. CSV
            export is available when Supabase is configured.
          </p>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader title="Filters" subtitle="Narrow pilot results for review." />
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase text-navy-500">IP signals</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIGNAL_KEYS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSignal(s)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    filters.signals.includes(s)
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-mist-200 text-navy-600"
                  }`}
                >
                  {SIGNAL_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-navy-500">
              Public disclosure risk
            </p>
            <select
              value={filters.disclosureRisk}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  disclosureRisk: e.target.value as "all" | "yes" | "no",
                }))
              }
              className="mt-2 rounded-lg border border-mist-200 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="yes">Flagged only</option>
              <option value="no">Not flagged</option>
            </select>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-navy-500">
              Referral / resource type
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {RESOURCE_KEYS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleResource(r)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    filters.resources.includes(r)
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-mist-200 text-navy-600"
                  }`}
                >
                  {RESOURCE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-navy-500">
              Clarity improvement
            </p>
            <select
              value={filters.clarity}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  clarity: e.target.value as ClarityFilter,
                }))
              }
              className="mt-2 rounded-lg border border-mist-200 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="improved">Improved (post &gt; pre)</option>
              <option value="same">Same</option>
              <option value="declined">Declined</option>
              <option value="no_response">No post response</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="mt-8">
          <p className="text-sm text-navy-500">Loading metrics…</p>
        </Card>
      ) : !metrics || (metrics.totalIntakes === 0 && !includeDemo) ? (
        <Card className="mt-8">
          <p className="text-sm text-navy-600">
            No intakes recorded yet.{" "}
            <Link
              href="/smartprobonoip/disclaimer?demo=1"
              className="text-teal-600 hover:underline"
            >
              Try demo intake
            </Link>{" "}
            to populate the dashboard.
          </p>
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-navy-500">
            Showing {filteredRecords.length} of {displayRecords.length} records
            {liveCount === 0 && includeDemo ? " (demo only)" : ""}.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total intakes completed" value={metrics.totalIntakes} />
            <StatCard label="Profiles generated" value={metrics.totalProfiles} />
            <StatCard
              label="Users with public sharing risk"
              value={metrics.publicDisclosureCount}
              hint="Flagged possible public disclosure"
            />
            <StatCard
              label="Avg. clarity (pre → post)"
              value={`${metrics.avgPreClarity ?? "—"} → ${metrics.avgPostClarity ?? "—"}`}
              hint={`${metrics.clarityResponses} post-profile responses`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Clarity improved"
              value={metrics.clarityImprovedCount}
              hint="Post clarity higher than pre"
            />
            <StatCard
              label="Avg. clarity delta"
              value={metrics.avgClarityDelta ?? "—"}
              hint="Average post − pre score"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <BarList
              title="Most common IP category signals"
              total={metrics.totalProfiles}
              entries={(Object.entries(metrics.signalCounts) as [IpSignal, number][]).map(
                ([k, v]) => ({ label: SIGNAL_LABELS[k], value: v }),
              )}
            />
            <BarList
              title="Referrals by resource type"
              total={metrics.totalProfiles}
              entries={(
                Object.entries(metrics.referralCounts) as [ResourceCategory, number][]
              ).map(([k, v]) => ({ label: RESOURCE_LABELS[k], value: v }))}
            />
          </div>

          <Card>
            <CardHeader
              title="Follow-up status (30 / 60 / 90 day)"
              subtitle="Placeholder tracking for pilot partners."
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
                  <p className="mt-1 text-2xl font-bold text-navy-900">{f.value}</p>
                  <p className="text-xs text-navy-400">completed</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent intakes (anonymized)" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-mist-200 text-xs uppercase text-navy-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Signals</th>
                    <th className="py-2 pr-4">Disclosure</th>
                    <th className="py-2 pr-4">Clarity Δ</th>
                    <th className="py-2">Top resource</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.slice(0, 12).map((r) => {
                    const delta = clarityDelta(r);
                    return (
                      <tr key={r.id} className="border-b border-mist-100">
                        <td className="py-2 pr-4 text-navy-700">
                          {new Date(r.createdAt).toLocaleDateString()}
                          {r.isDemo ? (
                            <span className="ml-1 text-xs text-teal-600">demo</span>
                          ) : null}
                        </td>
                        <td className="py-2 pr-4 text-navy-600">
                          {r.profile.signals
                            .slice(0, 2)
                            .map((s) => SIGNAL_LABELS[s])
                            .join(", ")}
                        </td>
                        <td className="py-2 pr-4">
                          {r.profile.publicDisclosure ? "Flagged" : "—"}
                        </td>
                        <td className="py-2 pr-4">
                          {typeof delta === "number"
                            ? delta > 0
                              ? `+${delta}`
                              : String(delta)
                            : "—"}
                        </td>
                        <td className="py-2 text-navy-600">
                          {RESOURCE_LABELS[r.profile.recommendedResources[0]] ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
