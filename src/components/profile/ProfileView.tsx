import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import {
  RESOURCE_DESCRIPTIONS,
  RESOURCE_LABELS,
  SIGNAL_DESCRIPTIONS,
  SIGNAL_LABELS,
} from "@/lib/labels";
import {
  buildFollowUpPlan,
  buildIdeaSummaryFields,
  buildReadinessSnapshot,
} from "@/lib/packet";
import type { ProjectRecord } from "@/lib/types";

export function ProfileView({ record }: { record: ProjectRecord }) {
  const { profile } = record;
  const summaryFields = buildIdeaSummaryFields(record.answers);
  const snapshot = buildReadinessSnapshot(record);
  const followUpPlan = buildFollowUpPlan();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Plain-language idea summary" />
        <p className="text-navy-700">{profile.ideaSummary}</p>
        {summaryFields.length > 0 ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {summaryFields.map((field) => (
              <div
                key={field.label}
                className="rounded-lg border border-mist-200 bg-mist-50 p-3"
              >
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  {field.label}
                </dt>
                <dd className="mt-1 text-sm text-navy-700">{field.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Card>

      <Card>
        <CardHeader
          title="Readiness snapshot"
          subtitle="A quick view of where your idea stands today."
        />
        {profile.signals.length > 0 ? (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              Possible IP signals
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.signals.map((s) => (
                <Badge key={s} tone="navy">
                  {SIGNAL_LABELS[s]}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          {snapshot.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border p-3 ${
                item.flagged
                  ? "border-amber-300 bg-amber-50"
                  : "border-mist-200 bg-mist-50"
              }`}
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm text-navy-700">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <CardHeader
          title="Possible IP category signals"
          subtitle="These are starting points, not conclusions."
        />
        <ul className="space-y-2">
          {profile.signals.map((s) => (
            <li key={s} className="text-sm text-navy-600">
              <span className="font-medium text-navy-800">
                {SIGNAL_LABELS[s]}:
              </span>{" "}
              {SIGNAL_DESCRIPTIONS[s]}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="What information is complete" />
          {profile.completeInfo.length ? (
            <ul className="space-y-1.5 text-sm text-navy-700">
              {profile.completeInfo.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-teal-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-500">Nothing recorded yet.</p>
          )}
        </Card>
        <Card>
          <CardHeader title="Missing information checklist" />
          {profile.missingInfo.length ? (
            <ul className="space-y-1.5 text-sm text-navy-700">
              {profile.missingInfo.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-amber-600">•</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-500">
              Looks complete — nice work.
            </p>
          )}
        </Card>
      </div>

      <Card
        className={
          profile.publicDisclosure ? "border-amber-300 bg-amber-50" : undefined
        }
      >
        <CardHeader
          title="Public sharing / disclosure note"
          subtitle={
            profile.publicDisclosure
              ? "Possible public disclosure detected"
              : "No public disclosure indicated"
          }
        />
        <p className="text-sm text-navy-700">{profile.publicDisclosureNote}</p>
      </Card>

      <Card className="border-teal-200 bg-teal-50">
        <CardHeader title="Suggested next step" />
        <p className="text-navy-800">{profile.suggestedNextStep}</p>
      </Card>

      <Card>
        <CardHeader title="Expert conversation prep" subtitle="Questions to bring to an expert." />
        <ul className="space-y-2 text-sm text-navy-700">
          {profile.expertQuestions.map((q) => (
            <li key={q} className="flex gap-2">
              <span className="text-navy-400">?</span>
              {q}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Suggested next resources"
          subtitle="Consider exploring these to prepare."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {profile.recommendedResources.map((r) => (
            <div
              key={r}
              className="rounded-lg border border-mist-200 bg-mist-50 p-3"
            >
              <p className="text-sm font-semibold text-navy-800">
                {RESOURCE_LABELS[r]}
              </p>
              <p className="mt-1 text-xs text-navy-500">
                {RESOURCE_DESCRIPTIONS[r]}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="30 / 60 / 90 day follow-up plan"
          subtitle="A simple, educational plan to keep preparing."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {followUpPlan.map((step) => (
            <div
              key={step.window}
              className="rounded-lg border border-mist-200 bg-mist-50 p-4"
            >
              <p className="text-sm font-semibold text-teal-700">
                {step.window}
              </p>
              <p className="text-sm font-medium text-navy-800">{step.title}</p>
              <ul className="mt-2 space-y-1.5 text-xs text-navy-600">
                {step.actions.map((action) => (
                  <li key={action} className="flex gap-2">
                    <span className="text-teal-600">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <DisclaimerNotice />
    </div>
  );
}
