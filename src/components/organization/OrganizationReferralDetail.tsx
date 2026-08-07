"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/routes";
import {
  ORGANIZATION_REFERRAL_STATUSES,
  type OrganizationReferralRecord,
  type OrganizationReferralStatus,
} from "@/lib/organization/types";

const STATUS_LABELS: Record<OrganizationReferralStatus, string> = {
  received: "Received",
  reviewing: "Reviewing",
  needs_information: "Needs information",
  completed: "Completed",
  declined: "Declined",
  referred_elsewhere: "Referred elsewhere",
};

export function OrganizationReferralDetail({ referralId }: { referralId: string }) {
  const [referral, setReferral] = useState<OrganizationReferralRecord | null>(null);
  const [status, setStatus] = useState<OrganizationReferralStatus>("received");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/organization/referrals/${referralId}`)
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = ROUTES.organizationLogin;
          return null;
        }
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setReferral(data.referral);
        setStatus(data.referral.status);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [referralId]);

  async function saveStatus() {
    if (!referral) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/organization/referrals/${referralId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    if (!res.ok) {
      setMessage("Could not update status.");
      return;
    }
    const data = await res.json();
    setReferral(data.referral);
    setMessage("Status updated.");
  }

  if (loading) {
    return <p className="text-sm text-navy-500">Loading referral…</p>;
  }

  if (!referral) {
    return <p className="text-sm text-navy-500">Referral not found.</p>;
  }

  const snapshot = referral.sharedSnapshot;

  return (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardHeader
          title="Referral detail"
          subtitle="Frozen snapshot at consent time — inventor edits after sharing do not change this view."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="gray">{STATUS_LABELS[referral.status]}</Badge>
          <span className="text-sm text-navy-500">
            Shared {new Date(referral.createdAt).toLocaleString()}
          </span>
        </div>
      </Card>

      {snapshot.readiness?.overallScore != null ? (
        <Card>
          <CardHeader title="Overall readiness" />
          <p className="text-3xl font-semibold text-navy-900">
            {snapshot.readiness.overallScore}
            <span className="text-base font-normal text-navy-500"> / 100</span>
          </p>
        </Card>
      ) : null}

      {snapshot.readiness?.categoryBreakdown?.length ? (
        <Card>
          <CardHeader title="Category breakdown" />
          <ul className="space-y-2 text-sm">
            {snapshot.readiness.categoryBreakdown.map((category) => (
              <li key={category.id} className="flex justify-between gap-3">
                <span className="text-navy-700">{category.label}</span>
                <span className="font-medium text-navy-900">
                  {category.score}/{category.max}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {snapshot.readiness?.preparationSignals?.length ? (
        <Card>
          <CardHeader title="Preparation signals" />
          <ul className="flex flex-wrap gap-2">
            {snapshot.readiness.preparationSignals.map((signal) => (
              <li key={signal.id}>
                <Badge tone="teal">{signal.label}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {snapshot.readiness?.missingInformationCategories?.length ? (
        <Card>
          <CardHeader title="Missing information categories" />
          <ul className="list-disc space-y-1 pl-5 text-sm text-navy-700">
            {snapshot.readiness.missingInformationCategories.map((item) => (
              <li key={`${item.categoryId}-${item.label}`}>{item.label}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {snapshot.referral?.reason ? (
        <Card>
          <CardHeader title="Referral reason" />
          <p className="text-sm text-navy-700">{snapshot.referral.reason}</p>
        </Card>
      ) : null}

      {snapshot.invention?.title ? (
        <Card>
          <CardHeader title="Invention title (shared by inventor)" />
          <p className="text-sm text-navy-800">{snapshot.invention.title}</p>
        </Card>
      ) : null}

      {snapshot.invention?.plainSummary ? (
        <Card>
          <CardHeader title="Plain-language summary (shared by inventor)" />
          <p className="text-sm text-navy-700">{snapshot.invention.plainSummary}</p>
        </Card>
      ) : null}

      {snapshot.packet?.exportMetadata ? (
        <Card>
          <CardHeader title="Packet / export metadata" />
          <p className="text-sm text-navy-600">
            {snapshot.packet.exportMetadata.documentCount} document(s) on record
          </p>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Update status" subtitle="Operational tracking only — not a legal outcome." />
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-700">Status</span>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as OrganizationReferralStatus)
              }
              className="rounded-md border border-mist-300 px-3 py-2 text-sm"
            >
              {ORGANIZATION_REFERRAL_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={saveStatus}
            disabled={saving}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save status"}
          </button>
        </div>
        {message ? <p className="mt-2 text-sm text-teal-700">{message}</p> : null}
      </Card>
    </div>
  );
}
