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
  buildDifferenceMap,
  buildExpertHandoff,
  buildFollowUpPlan,
  buildIdeaSummaryFields,
  buildMaterialsChecklist,
  buildPatentPrepChecklist,
  buildReadinessSnapshot,
  DEVELOPMENT_TIMELINE_FIELDS,
  DIFFERENCE_MAP_NOTE,
  PATENT_PREP_INTRO,
  TIMELINE_NOTE,
} from "@/lib/packet";
import type { ProjectRecord } from "@/lib/types";

export function ProfileView({ record }: { record: ProjectRecord }) {
  const { profile } = record;
  const summaryFields = buildIdeaSummaryFields(record.answers);
  const snapshot = buildReadinessSnapshot(record);
  const followUpPlan = buildFollowUpPlan();
  const patentPrep = buildPatentPrepChecklist(record);
  const differenceMap = buildDifferenceMap(record);
  const materials = buildMaterialsChecklist(record);
  const handoff = buildExpertHandoff(record);

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

      <div className="rounded-xl border border-navy-200 bg-navy-50/40 p-1">
        <div className="px-3 py-2">
          <h2 className="text-lg font-bold text-navy-900">Patent Prep Mode</h2>
          <p className="mt-1 text-sm text-navy-600">{PATENT_PREP_INTRO}</p>
        </div>

        <div className="space-y-6 p-2">
          <Card>
            <CardHeader title="Patent prep checklist" />
            <ul className="space-y-2.5">
              {patentPrep.map((row) => (
                <li key={row.label} className="text-sm">
                  <span className="flex items-start gap-2">
                    <span
                      className={
                        row.complete ? "text-teal-600" : "text-amber-600"
                      }
                    >
                      {row.complete ? "☑" : "☐"}
                    </span>
                    <span>
                      <span className="font-medium text-navy-800">
                        {row.label}
                      </span>
                      {row.value ? (
                        <span className="mt-0.5 block text-navy-600">
                          {row.value}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Development timeline" subtitle={TIMELINE_NOTE} />
            <dl className="space-y-3">
              {DEVELOPMENT_TIMELINE_FIELDS.map((field) => (
                <div key={field} className="flex flex-col gap-1">
                  <dt className="text-sm font-medium text-navy-800">{field}</dt>
                  <dd className="h-7 rounded-md border border-dashed border-mist-300 bg-mist-50" />
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Possible difference map" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-mist-200 text-xs uppercase text-navy-500">
                    <th className="py-2 pr-4">Existing option / current approach</th>
                    <th className="py-2 pr-4">What my idea does differently</th>
                    <th className="py-2">Why that difference matters</th>
                  </tr>
                </thead>
                <tbody>
                  {differenceMap.map((row, idx) => (
                    <tr key={idx} className="border-b border-mist-100 align-top">
                      <td className="py-2 pr-4 text-navy-600">{row.existing}</td>
                      <td className="py-2 pr-4 text-navy-700">{row.difference}</td>
                      <td className="py-2 text-navy-600">{row.whyItMatters}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-amber-700">{DIFFERENCE_MAP_NOTE}</p>
          </Card>

          <Card>
            <CardHeader title="Drawings and materials checklist" />
            <ul className="grid gap-2 sm:grid-cols-2">
              {materials.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-sm text-navy-700"
                >
                  <span
                    className={
                      item.available ? "text-teal-600" : "text-navy-300"
                    }
                  >
                    {item.available ? "☑" : "☐"}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-teal-200">
            <CardHeader
              title="Expert handoff summary"
              subtitle="For review by a patent agent, attorney, clinic, mentor, or innovation partner."
            />
            <dl className="space-y-3 text-sm">
              {[
                { label: "Idea summary", value: handoff.ideaSummary },
                { label: "Main components", value: handoff.mainComponents },
                { label: "How it works", value: handoff.howItWorks },
                {
                  label: "User-described differences",
                  value: handoff.differences,
                },
                { label: "Prototype status", value: handoff.prototypeStatus },
                {
                  label: "Public sharing timeline",
                  value: handoff.publicSharingTimeline,
                },
                {
                  label: "Materials available",
                  value: handoff.materialsAvailable,
                },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-navy-700">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                Questions for expert review
              </p>
              <ul className="mt-1 space-y-1.5 text-sm text-navy-700">
                {handoff.expertQuestions.map((q) => (
                  <li key={q} className="flex gap-2">
                    <span className="text-navy-400">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>

      <DisclaimerNotice />
    </div>
  );
}
