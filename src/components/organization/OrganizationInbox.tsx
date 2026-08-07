"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/routes";
import type { OrganizationReferralListItem } from "@/lib/organization/types";

const STATUS_LABELS: Record<string, string> = {
  received: "Received",
  reviewing: "Reviewing",
  needs_information: "Needs information",
  completed: "Completed",
  declined: "Declined",
  referred_elsewhere: "Referred elsewhere",
};

export function OrganizationInbox() {
  const [referrals, setReferrals] = useState<OrganizationReferralListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/organization/referrals")
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = ROUTES.organizationLogin;
          return null;
        }
        if (!res.ok) throw new Error("Failed to load referrals");
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setReferrals(data.referrals ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load referrals.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-sm text-navy-500">Loading inbox…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <Card variant="elevated">
        <CardHeader
          title="Referral inbox"
          subtitle="Inventor-initiated snapshots only. You cannot browse or search packets."
        />
      </Card>

      {referrals.length === 0 ? (
        <Card>
          <p className="text-sm text-navy-500">No referrals yet.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {referrals.map((referral) => (
            <li key={referral.id}>
              <Link href={ROUTES.organizationReferral(referral.id)}>
                <Card className="transition hover:border-teal-200 hover:shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-navy-900">
                        {referral.hasTitle
                          ? "Referral with title shared"
                          : "Referral (readiness snapshot)"}
                      </p>
                      <p className="mt-1 text-sm text-navy-500">
                        Received {new Date(referral.createdAt).toLocaleDateString()}
                        {referral.readinessScore != null
                          ? ` · Readiness ${referral.readinessScore}`
                          : ""}
                      </p>
                    </div>
                    <Badge tone="gray">
                      {STATUS_LABELS[referral.status] ?? referral.status}
                    </Badge>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
