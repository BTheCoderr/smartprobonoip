"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ROUTES } from "@/lib/routes";
import { canonicalFieldLabel } from "@/lib/handoff/canonicalFields";
import type { ProfessionalHandoffSession } from "@/lib/types";

async function readError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? "Request failed";
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join("\n");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export function OrganizationSharedIntakePanel({
  referralId,
}: {
  referralId: string;
}) {
  const [handoff, setHandoff] = useState<ProfessionalHandoffSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/organization/referrals/${referralId}/handoff`)
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = ROUTES.organizationLogin;
          return null;
        }
        if (!res.ok) throw new Error(await readError(res));
        return res.json();
      })
      .then((data: { handoff?: ProfessionalHandoffSession | null } | null) => {
        if (!active || !data) return;
        setHandoff(data.handoff ?? null);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load shared intake.");
        }
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [referralId]);

  if (!loaded) {
    return (
      <Card>
        <p className="text-sm text-navy-500">Checking for an inventor-approved intake…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-amber-800">{error}</p>
      </Card>
    );
  }

  if (!handoff) {
    return (
      <Card>
        <CardHeader
          title="Firm intake"
          subtitle="No organization-specific intake has been explicitly approved and shared by the inventor yet."
        />
        <p className="text-sm leading-relaxed text-navy-500">
          The referral snapshot remains available above. If your organization has
          a verified intake template, the inventor can map their existing
          SmartProBonoIP record into it, review the answers, and choose to share it.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-teal-200">
      <CardHeader
        title="Inventor-approved firm intake"
        subtitle="Answers below were mapped or entered in the inventor's SmartProBonoIP workspace and explicitly shared. This is preparation material, not a legal conclusion."
      />

      <div className="rounded-xl border border-mist-200 bg-mist-50/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
          {(handoff.organizationName ?? "Organization") + " · " + handoff.templateName}
        </p>
        <p className="mt-2 text-sm text-navy-700">
          {handoff.mappedQuestionCount} answered · {handoff.unresolvedQuestionCount} unresolved
          {handoff.sharedAt
            ? " · shared " + new Date(handoff.sharedAt).toLocaleString()
            : ""}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {handoff.answers.map((answer) => (
          <div
            key={answer.id}
            className="rounded-xl border border-mist-200 bg-white p-4"
          >
            {answer.sectionName ? (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                {answer.sectionName}
              </p>
            ) : null}
            <p className="mt-1 text-sm font-semibold text-navy-900">
              {answer.questionText}
              {answer.requiredByProfessional ? " *" : ""}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy-700">
              {displayValue(answer.answerValue) || "No answer shared."}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-wide text-navy-400">
              {answer.resolutionMethod === "user_answered"
                ? "Entered by inventor"
                : answer.resolutionMethod === "professional_answered"
                  ? "Entered during professional review"
                  : "Mapped from inventor record"}
            </p>
            {answer.sourceCanonicalKeys.length > 0 ? (
              <p className="mt-1 text-[11px] text-navy-500">
                Source field{answer.sourceCanonicalKeys.length > 1 ? "s" : ""}:{" "}
                {answer.sourceCanonicalKeys
                  .map((key) => canonicalFieldLabel(key))
                  .join(", ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
