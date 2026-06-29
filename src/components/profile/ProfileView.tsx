import { Card, CardHeader } from "@/components/ui/Card";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import {
  RESOURCE_DESCRIPTIONS,
  RESOURCE_LABELS,
  SIGNAL_LABELS,
} from "@/lib/labels";
import { PACKET_COPY } from "@/lib/copy";
import { SIGNAL_CATALOG } from "@/lib/signals";
import { SignalCard } from "@/components/ui/design";
import {
  buildDifferenceMap,
  buildExpertHandoff,
  buildFollowUpPlan,
  buildIdeaSummaryFields,
  buildMaterialsChecklist,
  buildMissingInfoStatus,
  buildNextBestAction,
  buildPatentPrepChecklist,
  buildReadinessMetrics,
  buildReadinessSnapshot,
  DIFFERENCE_MAP_NOTE,
  PATENT_PREP_INTRO,
} from "@/lib/packet";
import { getTriggeredMiniPrepSections } from "@/lib/miniPrepSections";
import { MiniPrepSectionCard } from "@/components/profile/MiniPrepSectionCard";
import { DevelopmentTimelineEditor } from "@/components/profile/DevelopmentTimelineEditor";
import {
  buildPatentSearchPrep,
  WORKSHEET_HEADERS,
} from "@/lib/patentSearchPrep";
import { ResearchPrepWorkspace } from "@/components/research/ResearchPrepWorkspace";
import { CpcSuggestionPanel } from "@/components/research/ExternalSearchTools";
import { ResearchErrorBoundary } from "@/components/research/ResearchErrorBoundary";
import type { ProjectRecord } from "@/lib/types";
import type { SavedReference } from "@/lib/research/types";

export function ProfileView({
  record,
  savedReferenceCount = 0,
  onReferencesChange,
  onTimelineSaved,
}: {
  record: ProjectRecord;
  savedReferenceCount?: number;
  onReferencesChange?: (refs: SavedReference[]) => void;
  onTimelineSaved?: (record: ProjectRecord) => void;
}) {
  const { profile } = record;
  const summaryFields = buildIdeaSummaryFields(record.answers);
  const snapshot = buildReadinessSnapshot(record);
  const followUpPlan = buildFollowUpPlan();
  const patentPrep = buildPatentPrepChecklist(record);
  const missingStatus = buildMissingInfoStatus(record, savedReferenceCount);
  const readinessMetrics = buildReadinessMetrics(record, savedReferenceCount);
  const nextBestAction = buildNextBestAction(record, savedReferenceCount);
  const differenceMap = buildDifferenceMap(record);
  const materials = buildMaterialsChecklist(record);
  const handoff = buildExpertHandoff(record);
  const searchPrep = buildPatentSearchPrep(record);
  const miniPrepSections = getTriggeredMiniPrepSections(record);

  return (
    <div className="space-y-8">
      <div className="paper-card-elevated relative overflow-hidden border-teal-100 p-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-warm-400" />
        <div className="border-b border-dashed border-mist-200 px-6 py-4 sm:px-8">
          <span className="document-tab">Section 01</span>
        </div>
        <div className="px-6 pb-6 sm:px-8">
        <CardHeader
          kicker="IP Readiness Packet"
          title={PACKET_COPY.ideaAtGlance}
          subtitle="A plain-language summary you can bring to your next conversation."
        />
        <p className="text-base leading-relaxed text-navy-700">
          {profile.ideaSummary}
        </p>
        {summaryFields.length > 0 ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {summaryFields.map((field) => (
              <div
                key={field.label}
                className="rounded-2xl border border-mist-200/80 bg-mist-50/70 p-4"
              >
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  {field.label}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-navy-700">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        </div>
      </div>

      <div className="paper-card overflow-hidden p-0">
        <div className="border-b border-dashed border-mist-200 px-6 py-4 sm:px-8">
          <span className="document-tab">Readiness report</span>
        </div>
        <div className="px-6 pb-6 sm:px-8">
        <CardHeader
          title={PACKET_COPY.readinessSnapshotTitle}
          subtitle="A quick view of where your idea stands today."
        />
        {profile.signals.length > 0 ? (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {PACKET_COPY.signalsSection}
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
        </div>
      </div>

      <div className="paper-card overflow-hidden p-0">
        <div className="border-b border-dashed border-mist-200 px-6 py-4 sm:px-8">
          <span className="document-tab">Review notes</span>
        </div>
        <div className="px-6 pb-6 sm:px-8">
        <CardHeader
          title={PACKET_COPY.signalsSection}
          subtitle={PACKET_COPY.signalsSubtitle}
        />
        <ul className="space-y-4">
          {profile.signals.map((s) => {
            const guide = SIGNAL_CATALOG[s];
            return (
              <li key={s}>
                <SignalCard
                  label={guide.label}
                  whyItMatters={guide.whyItMatters}
                  whatToPrepare={guide.whatToPrepare}
                  suggestedResourceType={guide.suggestedResourceType}
                />
              </li>
            );
          })}
        </ul>
        </div>
      </div>

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
          <CardHeader title={PACKET_COPY.missingInfoTitle} />
          <p className="mb-3 text-sm font-medium text-navy-800">
            {missingStatus.statusMessage}
          </p>
          {missingStatus.coreMissing.length > 0 ? (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-500">
                Core intake
              </p>
              <ul className="space-y-1.5 text-sm text-navy-700">
                {missingStatus.coreMissing.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {missingStatus.optionalGaps.length > 0 ? (
            <>
              <p
                className={`mb-2 text-xs font-semibold uppercase tracking-wide text-navy-500 ${
                  missingStatus.coreMissing.length > 0 ? "mt-4" : ""
                }`}
              >
                Optional prep areas
              </p>
              <ul className="space-y-1.5 text-sm text-navy-700">
                {missingStatus.optionalGaps.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-navy-400">○</span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {missingStatus.coreMissing.length === 0 &&
          missingStatus.optionalGaps.length === 0 ? (
            <p className="text-sm text-navy-500">Core intake is complete.</p>
          ) : null}
        </Card>
      </div>

      <Card
        variant={profile.publicDisclosure ? "default" : "soft"}
        className={
          profile.publicDisclosure
            ? "border-amber-300 bg-amber-50/50"
            : undefined
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

      {miniPrepSections.length > 0 ? (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
              Targeted prep
            </p>
            <h2 className="mt-1 text-xl font-bold text-navy-900">
              {PACKET_COPY.miniPrepTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {PACKET_COPY.miniPrepSubtitle}
            </p>
          </div>
          {miniPrepSections.map((section) => (
            <MiniPrepSectionCard key={section.id} section={section} />
          ))}
        </div>
      ) : null}

      <Card variant="accent">
        <CardHeader title={PACKET_COPY.nextBestStepTitle} />
        <p className="text-base leading-relaxed text-navy-800">
          {profile.suggestedNextStep}
        </p>
      </Card>

      <Card variant="elevated">
        <CardHeader
          title={PACKET_COPY.expertPrepTitle}
          subtitle="Questions to bring with you."
        />
        <ul className="space-y-3">
          {profile.expertQuestions.map((q, i) => (
            <li
              key={q}
              className="flex gap-3 rounded-xl border border-mist-200/80 bg-mist-50/60 px-4 py-3 text-sm leading-relaxed text-navy-700"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                {i + 1}
              </span>
              {q}
            </li>
          ))}
        </ul>
      </Card>

      <Card variant="elevated">
        <CardHeader
          title={PACKET_COPY.resourcesTitle}
          subtitle="Consider exploring these to prepare."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {profile.recommendedResources.map((r) => (
            <div
              key={r}
              className="rounded-2xl border border-mist-200/80 bg-gradient-to-br from-white to-mist-50 p-4 shadow-sm"
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

      <div className="overflow-hidden rounded-3xl border border-navy-200/80 bg-gradient-to-br from-navy-50/80 to-white p-2 shadow-[var(--shadow-soft)]">
        <div className="rounded-2xl bg-white/70 px-5 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            Deep prep
          </p>
          <h2 className="mt-1 text-xl font-bold text-navy-900 sm:text-2xl">
            {PACKET_COPY.patentPrepTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            {PATENT_PREP_INTRO}
          </p>
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

          <DevelopmentTimelineEditor record={record} onSaved={onTimelineSaved} />

          <Card>
            <CardHeader
              title="Possible difference map"
              subtitle={PACKET_COPY.differenceMapSubtitle}
            />
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
            <CardHeader
              title="Drawings and materials checklist"
              subtitle={PACKET_COPY.materialsChecklistSubtitle}
            />
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
                { label: "Idea", value: handoff.idea },
                { label: "Problem", value: handoff.problem },
                { label: "How it works", value: handoff.howItWorks },
                { label: "Main components", value: handoff.mainComponents },
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

      <div
        id="similar-reference-search-prep"
        className="overflow-hidden rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-50/40 to-white p-2 shadow-[var(--shadow-soft)]"
      >
        <div className="rounded-2xl bg-white/70 px-5 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            Reference prep
          </p>
          <h2 className="mt-1 text-xl font-bold text-navy-900 sm:text-2xl">
            {PACKET_COPY.similarReferenceSearchPrepTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            {PACKET_COPY.similarReferenceSearchPrepIntro}
          </p>
          <Link
            href={`/smartprobonoip/profile/${record.id}/research`}
            className="mt-3 inline-block text-sm font-medium text-teal-700 hover:text-teal-900"
          >
            Open full-screen workspace →
          </Link>
        </div>

        <div className="space-y-6 p-2">
          <Card>
            <CardHeader title="Search keywords" />
            <div className="flex flex-wrap gap-2">
              {searchPrep.searchKeywords.length > 0 ? (
                searchPrep.searchKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-mist-100 px-3 py-1 text-sm text-navy-700"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <p className="text-sm text-navy-500">
                  Add more detail to your packet to generate keywords.
                </p>
              )}
            </div>
          </Card>

          <CpcSuggestionPanel record={record} />

          <ResearchErrorBoundary>
            <ResearchPrepWorkspace
              key={record.id}
              record={record}
              onReferencesChange={onReferencesChange}
            />
          </ResearchErrorBoundary>

          <details className="group">
            <summary className="cursor-pointer list-none rounded-2xl border border-mist-200 bg-white px-4 py-3 text-sm font-medium text-navy-800 hover:bg-mist-50 [&::-webkit-details-marker]:hidden">
              Optional printable worksheet template
            </summary>
            <Card className="mt-3">
              <CardHeader title="Similar reference worksheet" />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-mist-200 text-xs uppercase text-navy-500">
                      {WORKSHEET_HEADERS.map((h) => (
                        <th key={h} className="py-2 pr-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {searchPrep.worksheetRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-mist-100 align-top">
                        <td className="py-2 pr-3 text-navy-700">
                          {row.searchQueryUsed}
                        </td>
                        <td className="py-2 pr-3 text-navy-600">
                          {row.referenceFound}
                        </td>
                        <td className="py-2 pr-3 text-navy-600">
                          {row.looksSimilar}
                        </td>
                        <td className="py-2 pr-3 text-navy-600">
                          {row.seemsDifferent}
                        </td>
                        <td className="py-2 text-navy-600">
                          {row.questionsForExpert}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </details>

          <Card>
            <CardHeader title="Expert prep questions" />
            <ul className="space-y-1.5 text-sm text-navy-700">
              {searchPrep.expertPrepQuestions.map((q) => (
                <li key={q} className="flex gap-2">
                  <span className="text-navy-400">?</span>
                  {q}
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-mist-100 pt-2 text-xs text-amber-700">
              {searchPrep.safeDisclaimer}
            </p>
          </Card>
        </div>
      </div>

      <Card variant="accent">
        <CardHeader
          title={PACKET_COPY.readinessSnapshotTitle}
          subtitle="Preparation only — not legal outcomes."
        />
        <dl className="grid gap-3 sm:grid-cols-2">
          {readinessMetrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                {metric.label}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-navy-800">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card variant="elevated" className="border-navy-200 bg-gradient-to-br from-navy-50/60 to-white">
        <CardHeader title={PACKET_COPY.nextBestStepTitle} />
        <p className="text-base leading-relaxed text-navy-800">
          {nextBestAction}
        </p>
      </Card>

      <DisclaimerNotice />
    </div>
  );
}
