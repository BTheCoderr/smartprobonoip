"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics/client";
import { pilotSessionHeaders } from "@/lib/pilotSession";
import {
  ORGANIZATION_CONSENT_DISCLAIMER,
  ORGANIZATION_CONSENT_SUBMIT_LABEL,
  SHARE_FIELD_DEFINITIONS,
  type ShareFieldDefinition,
} from "@/lib/organization/consent";
import type { ShareFieldKey } from "@/lib/organization/types";

export interface OrganizationShareTarget {
  organizationId: string;
  organizationName: string;
  registryPartnerId?: string;
  recommendationId?: string;
  referralReason?: string;
}

export function OrganizationShareConsent({
  projectId,
  target,
  onShared,
}: {
  projectId: string;
  target: OrganizationShareTarget;
  onShared?: (referralId: string) => void;
}) {
  const defaults = useMemo(
    () =>
      SHARE_FIELD_DEFINITIONS.filter((field) => field.defaultSelected).map(
        (field) => field.key,
      ),
    [],
  );
  const [selected, setSelected] = useState<Set<ShareFieldKey>>(
    () => new Set(defaults),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("organization_share_consent_viewed", {
      projectId,
      metadata: {
        partnerId: target.registryPartnerId,
        recommendationId: target.recommendationId,
      },
    });
  }, [projectId, target.registryPartnerId, target.recommendationId]);

  function toggleField(key: ShareFieldKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/records/${projectId}/organization-share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...pilotSessionHeaders(),
      },
      body: JSON.stringify({
        organizationId: target.organizationId,
        selectedFields: [...selected],
        registryPartnerId: target.registryPartnerId,
        recommendationId: target.recommendationId,
        referralReason: target.referralReason,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Could not share snapshot. Try again or contact support.");
      return;
    }

    const data = await res.json();
    trackEvent("organization_share_consent_submitted", {
      projectId,
      metadata: {
        partnerId: target.registryPartnerId,
        recommendationId: target.recommendationId,
        fieldCount: selected.size,
        referralId: data.referralId,
      },
    });
    setSuccess("Snapshot shared with the organization.");
    onShared?.(data.referralId);
  }

  function renderField(field: ShareFieldDefinition) {
    return (
      <label
        key={field.key}
        className="flex cursor-pointer items-start gap-3 rounded-lg border border-mist-200 p-3 hover:bg-mist-50"
      >
        <input
          type="checkbox"
          checked={selected.has(field.key)}
          onChange={() => toggleField(field.key)}
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium text-navy-900">
            {field.label}
          </span>
          <span className="mt-0.5 block text-xs text-navy-500">
            {field.description}
          </span>
        </span>
      </label>
    );
  }

  return (
    <Card variant="elevated" className="border-teal-200/80">
      <CardHeader
        title={`Share with ${target.organizationName}`}
        subtitle="Choose exactly what this organization may see. This creates a one-time snapshot."
      />
      <p className="mb-4 text-sm text-navy-600">{ORGANIZATION_CONSENT_DISCLAIMER}</p>

      <div className="space-y-2">{SHARE_FIELD_DEFINITIONS.map(renderField)}</div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || selected.size === 0}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
        >
          {submitting ? "Sharing…" : ORGANIZATION_CONSENT_SUBMIT_LABEL}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-teal-700">{success}</p> : null}
      </div>
    </Card>
  );
}
