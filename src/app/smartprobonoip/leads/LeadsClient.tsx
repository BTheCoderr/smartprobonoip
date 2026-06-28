"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { EmptyStateCard, PaperShell, StampLabel } from "@/components/ui/design";
import { BrandMark } from "@/components/brand/BrandMark";
import { INTEREST_TYPES, type InterestLead } from "@/lib/interest";
import { isApiStoreAvailable } from "@/lib/store/api";
import {
  getPartnerSecret,
  partnerSecretHeaders,
  setPartnerSecret,
} from "@/lib/pilotSession";

function interestTypeLabel(value: string | null): string {
  if (!value) return "—";
  return INTEREST_TYPES.find((t) => t.value === value)?.label ?? value;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function attrCell(value: string | null): string {
  return value?.trim() ? value : "—";
}

export default function LeadsClient() {
  const [partnerSecret, setPartnerSecretState] = useState("");
  const [secretSaved, setSecretSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<InterestLead[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const supabaseReady = isApiStoreAvailable();

  useEffect(() => {
    if (!supabaseReady) return;

    const secret = getPartnerSecret() ?? partnerSecret.trim();
    if (!secret) return;

    let active = true;

    async function loadLeads() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/partner/leads", {
          headers: partnerSecretHeaders(secret),
        });
        if (!res.ok) {
          if (active) {
            setUnlocked(false);
            setLeads([]);
            setError(
              res.status === 401
                ? "Invalid partner secret."
                : "Could not load leads.",
            );
          }
          return;
        }

        const data = (await res.json()) as { leads?: InterestLead[] };
        if (active) {
          setLeads(data.leads ?? []);
          setUnlocked(true);
          setError(null);
        }
      } catch {
        if (active) {
          setError("Could not load leads.");
          setUnlocked(false);
          setLeads([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadLeads();

    return () => {
      active = false;
    };
  }, [secretSaved, partnerSecret, supabaseReady]);

  const totalLeads = leads.length;

  const recentSummary = useMemo(() => {
    if (leads.length === 0) return null;
    const latest = leads[0];
    return `${interestTypeLabel(latest.interestType)} · ${latest.email}`;
  }, [leads]);

  function savePartnerSecret() {
    const trimmed = partnerSecret.trim();
    if (!trimmed) return;
    setPartnerSecret(trimmed);
    setSecretSaved((v) => !v);
  }

  async function exportCsv() {
    const secret = getPartnerSecret() ?? partnerSecret.trim();
    if (!secret) {
      alert("Enter the partner dashboard secret to export leads CSV.");
      return;
    }

    const res = await fetch("/api/partner/leads/export.csv", {
      headers: partnerSecretHeaders(secret),
    });
    if (!res.ok) {
      alert("Export failed. Check your partner secret.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "smartprobonoip-interest-leads.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PaperShell className="py-12 sm:py-16">
      <div className="dossier-card relative overflow-hidden px-6 py-6 shadow-[var(--shadow-paper-offset)] sm:px-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-teal-600 to-warm-500" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <BrandMark variant="compact" className="mb-4" />
            <StampLabel tone="teal">INTEREST LEADS</StampLabel>
            <h1 className="headline-editorial mt-4 text-3xl sm:text-4xl">
              Partner interest submissions
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-blue sm:text-base">
              Private view of contact and pilot interest form submissions. Do not
              share this page or export outside authorized partner workflows.
            </p>
          </div>
          <Link
            href="/smartprobonoip/dashboard"
            className="rounded-lg border border-mist-200 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-mist-50"
          >
            Partner dashboard →
          </Link>
        </div>
      </div>

      {supabaseReady ? (
        <Card className="mt-6">
          <CardHeader
            title="Partner access"
            subtitle="Required to view interest leads and export CSV."
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
              Unlock leads
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!unlocked}
              className="rounded-lg border border-mist-300 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-mist-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export leads CSV
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </Card>
      ) : (
        <Card className="mt-6">
          <p className="text-sm text-navy-600">
            Supabase is not configured. Interest leads are stored when Supabase
            and the interest API are enabled in production.
          </p>
        </Card>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-navy-500">Loading leads…</p>
      ) : !unlocked ? (
        <div className="mt-8">
          <EmptyStateCard
            title="Leads locked"
            body="Enter the partner dashboard secret to view interest form submissions."
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Total leads" value={String(totalLeads)} />
            {recentSummary ? (
              <MetricCard label="Most recent" value={recentSummary} />
            ) : null}
          </div>

          {leads.length === 0 ? (
            <div className="mt-8">
              <EmptyStateCard
                title="No leads yet"
                body="Interest form submissions will appear here newest first."
              />
            </div>
          ) : (
            <Card className="mt-8 overflow-x-auto">
              <CardHeader
                title="All submissions"
                subtitle="Newest first. Message text is what the user voluntarily submitted."
              />
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-mist-200 text-xs uppercase tracking-wide text-navy-500">
                    <th className="px-3 py-2 font-medium">Submitted</th>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Organization</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium">Interest</th>
                    <th className="px-3 py-2 font-medium">Message</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Medium</th>
                    <th className="px-3 py-2 font-medium">Campaign</th>
                    <th className="px-3 py-2 font-medium">Referrer</th>
                    <th className="px-3 py-2 font-medium">Landing</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-mist-100 align-top text-navy-700"
                    >
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-3 py-3">{attrCell(lead.name)}</td>
                      <td className="px-3 py-3">{lead.email}</td>
                      <td className="px-3 py-3">{attrCell(lead.organization)}</td>
                      <td className="px-3 py-3">{attrCell(lead.role)}</td>
                      <td className="px-3 py-3">
                        {interestTypeLabel(lead.interestType)}
                      </td>
                      <td className="max-w-xs px-3 py-3 whitespace-pre-wrap">
                        {attrCell(lead.message)}
                      </td>
                      <td className="px-3 py-3">{attrCell(lead.source)}</td>
                      <td className="px-3 py-3">{attrCell(lead.medium)}</td>
                      <td className="px-3 py-3">{attrCell(lead.campaign)}</td>
                      <td className="max-w-[12rem] truncate px-3 py-3">
                        {attrCell(lead.referrer)}
                      </td>
                      <td className="max-w-[12rem] truncate px-3 py-3">
                        {attrCell(lead.landingPage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </PaperShell>
  );
}
