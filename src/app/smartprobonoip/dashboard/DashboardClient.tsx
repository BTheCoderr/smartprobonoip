"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { EmptyStateCard, StampLabel } from "@/components/ui/design";
import { Badge } from "@/components/ui/Badge";
import { DemoChecklist } from "@/components/DemoChecklist";
import { DASHBOARD_COPY } from "@/lib/copy";
import { trackEvent } from "@/lib/analytics/client";
import {
  computePilotImpactFromRecords,
  type AnalyticsDashboardData,
} from "@/lib/analyticsMetrics";
import { DEFAULT_FILTERS, filterRecords } from "@/lib/dashboardFilters";
import { mergeWithDemoRecords } from "@/lib/demo";
import { clarityDelta, computeMetrics } from "@/lib/metrics";
import {
  computePartnerSummaries,
  partnerLabel,
  selectedPartnerSummary,
  uniqueFilterValues,
} from "@/lib/partnerMetrics";
import { PARTNER_CATALOG } from "@/lib/partnerTracking";
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
  const [analytics, setAnalytics] = useState<AnalyticsDashboardData | null>(null);
  const filterTracked = useRef(false);

  useEffect(() => {
    trackEvent("dashboard_viewed");
  }, []);

  useEffect(() => {
    if (!filterTracked.current) {
      filterTracked.current = true;
      return;
    }
    trackEvent("dashboard_filter_changed", {
      metadata: {
        filterName: "dashboard",
        filterValue: `${filters.partner}|${filters.source}|${filters.campaign}|${filters.demoMode}`,
      },
    });
  }, [filters]);

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
  const partnerSummaries = useMemo(
    () => computePartnerSummaries(filteredRecords),
    [filteredRecords],
  );
  const activePartnerSummary = useMemo(
    () => selectedPartnerSummary(filteredRecords, filters.partner),
    [filteredRecords, filters.partner],
  );
  const partnerOptions = useMemo(() => {
    const fromRecords = uniqueFilterValues(displayRecords, "partnerSlug");
    const catalog = Object.keys(PARTNER_CATALOG);
    return [...new Set([...catalog, ...fromRecords])].sort();
  }, [displayRecords]);
  const sourceOptions = useMemo(
    () => uniqueFilterValues(displayRecords, "source"),
    [displayRecords],
  );
  const campaignOptions = useMemo(
    () => uniqueFilterValues(displayRecords, "campaign"),
    [displayRecords],
  );
  const analyticsEnabled =
    isApiStoreAvailable() && Boolean(getPartnerSecret() ?? partnerSecret);
  const pilotImpact = useMemo(
    () => computePilotImpactFromRecords(filteredRecords),
    [filteredRecords],
  );

  useEffect(() => {
    if (!analyticsEnabled) return;
    const secret = getPartnerSecret() ?? partnerSecret;
    if (!secret) return;

    const params = new URLSearchParams({
      secret,
      partner: filters.partner,
      source: filters.source,
      campaign: filters.campaign,
    });
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);

    let active = true;
    fetch(`/api/partner/analytics?${params.toString()}`, {
      headers: partnerSecretHeaders(secret),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          setAnalytics(
            (data as { analytics?: AnalyticsDashboardData } | null)?.analytics ??
              null,
          );
        }
      })
      .catch(() => {
        if (active) setAnalytics(null);
      });
    return () => {
      active = false;
    };
  }, [analyticsEnabled, filters, secretSaved, partnerSecret]);

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
    trackEvent("csv_exported");
  }

  return (
    <div className="page-shell py-12 sm:py-16">
      <div className="paper-card-elevated relative overflow-hidden px-6 py-6 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-500 via-teal-600 to-warm-500" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <StampLabel tone="teal">PARTNER IMPACT</StampLabel>
            <h1 className="headline-editorial mt-4 text-3xl sm:text-4xl">
              {DASHBOARD_COPY.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-blue sm:text-base">
              {DASHBOARD_COPY.lead}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase text-navy-500">Partner</p>
              <select
                value={filters.partner}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, partner: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              >
                <option value="all">All partners</option>
                <option value="unattributed">Unattributed</option>
                {partnerOptions.map((slug) => (
                  <option key={slug} value={slug}>
                    {PARTNER_CATALOG[slug] ?? slug}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-navy-500">Source</p>
              <select
                value={filters.source}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, source: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              >
                <option value="all">All sources</option>
                {sourceOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-navy-500">Campaign</p>
              <select
                value={filters.campaign}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, campaign: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              >
                <option value="all">All campaigns</option>
                {campaignOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-navy-500">Data mode</p>
              <select
                value={filters.demoMode}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    demoMode: e.target.value as "all" | "live" | "demo",
                  }))
                }
                className="mt-2 w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              >
                <option value="all">Live + demo in view</option>
                <option value="live">Live only</option>
                <option value="demo">Demo only</option>
              </select>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-navy-500">From date</p>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-navy-500">To date</p>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-mist-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="mt-8">
          <p className="text-sm text-navy-500">Loading metrics…</p>
        </Card>
      ) : !metrics || (metrics.totalIntakes === 0 && !includeDemo) ? (
        <div className="mt-8">
          <EmptyStateCard
            title="No pilot packets yet"
            body="When inventors complete intake, you will see readiness signals, clarity trends, and referral patterns here."
            action={{
              href: "/smartprobonoip/disclaimer?demo=1",
              label: "Try demo intake",
            }}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-navy-500">
            Showing {filteredRecords.length} of {displayRecords.length} records
            {liveCount === 0 && includeDemo ? " (demo only)" : ""}.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total packets"
              value={metrics.totalIntakes}
              hint="Completed intakes in current view"
            />
            <MetricCard
              label="Profiles generated"
              value={metrics.totalProfiles}
              accent="navy"
            />
            <MetricCard
              label="Public sharing flagged"
              value={metrics.publicDisclosureCount}
              hint="Possible public disclosure noted"
              accent="warm"
            />
            <MetricCard
              label="Avg. clarity before → after"
              value={`${metrics.avgPreClarity ?? "—"} → ${metrics.avgPostClarity ?? "—"}`}
              hint={`${metrics.clarityResponses} post-packet responses`}
            />
          </div>

          {analyticsEnabled && analytics ? (
            <Card>
              <CardHeader
                title="Usage funnel"
                subtitle="First-party analytics from Supabase events (filtered view)."
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Landing views" value={analytics.funnel.landingViewed} />
                <MetricCard
                  label="Start / demo clicks"
                  value={analytics.funnel.startClicked + analytics.funnel.demoStarted}
                  accent="teal"
                />
                <MetricCard label="Intake started" value={analytics.funnel.intakeStarted} />
                <MetricCard label="Intake completed" value={analytics.funnel.intakeCompleted} />
                <MetricCard label="Packets generated" value={analytics.funnel.packetGenerated} />
                <MetricCard label="PDF downloads" value={analytics.funnel.pdfDownloaded} />
                <MetricCard
                  label="Recovery links"
                  value={analytics.funnel.recoveryLinkCreated}
                  accent="warm"
                />
                <MetricCard
                  label="Disclaimer accepted"
                  value={analytics.funnel.disclaimerAccepted}
                  accent="navy"
                />
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader
              title="Pilot impact"
              subtitle="Clarity lift and referral readiness from packet records."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Avg. clarity before"
                value={pilotImpact.avgPreClarity ?? "—"}
              />
              <MetricCard
                label="Avg. clarity after"
                value={pilotImpact.avgPostClarity ?? "—"}
                accent="teal"
              />
              <MetricCard
                label="Clarity lift"
                value={pilotImpact.clarityLift ?? "—"}
                accent="navy"
              />
              <MetricCard
                label="Strong referral readiness"
                value={pilotImpact.strongReferralReadiness}
                hint="2+ recommended resources"
                accent="warm"
              />
            </div>
          </Card>

          {analyticsEnabled && analytics && analytics.dropOff.lastCompletedStep.length > 0 ? (
            <Card>
              <CardHeader
                title="Intake drop-off"
                subtitle="Last completed intake step counts from analytics events."
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-mist-200 text-xs uppercase text-navy-500">
                      <th className="py-2 pr-4">Step completed</th>
                      <th className="py-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.dropOff.lastCompletedStep.map((row) => (
                      <tr key={row.step} className="border-b border-mist-100">
                        <td className="py-2 pr-4 text-navy-700">Step {row.step}</td>
                        <td className="py-2">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {analytics.dropOff.validationErrors.length > 0 ? (
                <div className="mt-6 overflow-x-auto">
                  <p className="mb-2 text-xs font-semibold uppercase text-navy-500">
                    Validation errors by field
                  </p>
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-mist-200 text-xs uppercase text-navy-500">
                        <th className="py-2 pr-4">Field</th>
                        <th className="py-2">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.dropOff.validationErrors.map((row) => (
                        <tr key={row.field} className="border-b border-mist-100">
                          <td className="py-2 pr-4 text-navy-700">{row.field}</td>
                          <td className="py-2">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </Card>
          ) : null}

          {analyticsEnabled && analytics && analytics.partnerPerformance.length > 0 ? (
            <Card>
              <CardHeader
                title="Partner performance (analytics)"
                subtitle="Completion, PDF downloads, and recovery usage by partner."
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-mist-200 text-xs uppercase text-navy-500">
                      <th className="py-2 pr-4">Partner</th>
                      <th className="py-2 pr-4">Packets</th>
                      <th className="py-2 pr-4">Completed</th>
                      <th className="py-2 pr-4">PDFs</th>
                      <th className="py-2">Recovery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.partnerPerformance.map((row) => (
                      <tr key={row.partnerSlug} className="border-b border-mist-100">
                        <td className="py-2 pr-4 font-medium text-navy-800">
                          {row.partnerName}
                        </td>
                        <td className="py-2 pr-4">{row.packets}</td>
                        <td className="py-2 pr-4">{row.intakeCompleted}</td>
                        <td className="py-2 pr-4">{row.pdfDownloads}</td>
                        <td className="py-2">{row.recoveryCreated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Clarity improved"
              value={metrics.clarityImprovedCount}
              hint="Post clarity higher than pre"
              accent="teal"
            />
            <MetricCard
              label="Avg. clarity delta"
              value={metrics.avgClarityDelta ?? "—"}
              hint="Average post − pre score"
              accent="navy"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <BarList
              title="Top signal categories"
              total={metrics.totalProfiles}
              entries={(Object.entries(metrics.signalCounts) as [IpSignal, number][]).map(
                ([k, v]) => ({ label: SIGNAL_LABELS[k], value: v }),
              )}
            />
            <BarList
              title="Referral readiness by resource"
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

          {activePartnerSummary ? (
            <Card>
              <CardHeader
                title={`Partner view: ${activePartnerSummary.partnerName}`}
                subtitle="Metrics for the selected partner filter."
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Packets"
                  value={activePartnerSummary.packetCount}
                />
                <MetricCard
                  label="Avg. clarity before → after"
                  value={`${activePartnerSummary.metrics.avgPreClarity ?? "—"} → ${activePartnerSummary.metrics.avgPostClarity ?? "—"}`}
                  accent="navy"
                />
                <MetricCard
                  label="Clarity improved"
                  value={activePartnerSummary.metrics.clarityImprovedCount}
                  accent="teal"
                />
                <MetricCard
                  label="Public sharing flagged"
                  value={activePartnerSummary.metrics.publicDisclosureCount}
                  accent="warm"
                />
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <BarList
                  title="Top signal categories"
                  total={activePartnerSummary.metrics.totalProfiles}
                  entries={(
                    Object.entries(activePartnerSummary.metrics.signalCounts) as [
                      IpSignal,
                      number,
                    ][]
                  ).map(([k, v]) => ({ label: SIGNAL_LABELS[k], value: v }))}
                />
                <BarList
                  title="Referral readiness by resource"
                  total={activePartnerSummary.metrics.totalProfiles}
                  entries={(
                    Object.entries(
                      activePartnerSummary.metrics.referralCounts,
                    ) as [ResourceCategory, number][]
                  ).map(([k, v]) => ({ label: RESOURCE_LABELS[k], value: v }))}
                />
              </div>
            </Card>
          ) : null}

          {partnerSummaries.length > 0 ? (
            <Card>
              <CardHeader
                title="Packets by partner"
                subtitle="Lightweight pilot attribution from URL params."
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-mist-200 text-xs uppercase text-navy-500">
                      <th className="py-2 pr-4">Partner</th>
                      <th className="py-2 pr-4">Packets</th>
                      <th className="py-2 pr-4">Clarity Δ</th>
                      <th className="py-2 pr-4">Top signal</th>
                      <th className="py-2">Top resource</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerSummaries.map((summary) => {
                      const topSignal = (
                        Object.entries(summary.metrics.signalCounts) as [
                          IpSignal,
                          number,
                        ][]
                      )
                        .sort((a, b) => b[1] - a[1])
                        .find(([, v]) => v > 0);
                      const topResource = (
                        Object.entries(summary.metrics.referralCounts) as [
                          ResourceCategory,
                          number,
                        ][]
                      )
                        .sort((a, b) => b[1] - a[1])
                        .find(([, v]) => v > 0);
                      return (
                        <tr key={summary.partnerSlug} className="border-b border-mist-100">
                          <td className="py-2 pr-4 font-medium text-navy-800">
                            {summary.partnerName}
                          </td>
                          <td className="py-2 pr-4">{summary.packetCount}</td>
                          <td className="py-2 pr-4">
                            {summary.metrics.avgClarityDelta ?? "—"}
                          </td>
                          <td className="py-2 pr-4 text-navy-600">
                            {topSignal ? SIGNAL_LABELS[topSignal[0]] : "—"}
                          </td>
                          <td className="py-2 text-navy-600">
                            {topResource ? RESOURCE_LABELS[topResource[0]] : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Recent intakes (anonymized)" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-mist-200 text-xs uppercase text-navy-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Partner</th>
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
                          {partnerLabel(r)}
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
