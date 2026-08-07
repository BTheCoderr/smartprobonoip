import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { buildPacketReviewSummary } from "@/lib/packetReview";
import { ROUTES } from "@/lib/routes";
import type { ProjectRecord } from "@/lib/types";

export function PacketReviewPanel({
  record,
  savedReferenceCount = 0,
}: {
  record: ProjectRecord;
  savedReferenceCount?: number;
}) {
  const review = buildPacketReviewSummary(record, savedReferenceCount);
  const scoreTone =
    review.readinessScore >= 75
      ? "from-navy-500 to-navy-600"
      : review.readinessScore >= 50
        ? "from-navy-400 to-navy-500"
        : "from-aqua-400 to-teal-600";

  return (
    <div id="packet-review" className="paper-card overflow-hidden p-0">
      <div className="border-b border-dashed border-mist-200 px-6 py-4 sm:px-8">
        <span className="document-tab">Strengthen your packet</span>
      </div>
      <div className="space-y-6 px-6 pb-6 sm:px-8">
        <CardHeader
          title="Interactive packet review"
          subtitle="Preparation only — not a legal conclusion. Use this to see what to strengthen before expert review."
        />

        <div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-navy-900">
              Packet preparation score
            </span>
            <span className="font-mono font-semibold text-navy-700">
              {review.readinessScore}/100
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-mist-200">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${scoreTone} transition-all`}
              style={{ width: `${review.readinessScore}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">
            {review.strengthenMessage}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card variant="soft">
            <CardHeader title="What is complete" />
            {review.completeSections.length > 0 ? (
              <ul className="space-y-1.5 text-sm text-navy-700">
                {review.completeSections.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-navy-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-navy-500">Complete sections will appear as you fill intake.</p>
            )}
          </Card>
          <Card>
            <CardHeader title="Sections that need attention" />
            {review.weakSections.length > 0 ? (
              <ul className="space-y-1.5 text-sm text-navy-700">
                {review.weakSections.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-teal-600">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-navy-500">No weak sections flagged right now.</p>
            )}
          </Card>
        </div>

        {review.topGaps.length > 0 ? (
          <Card variant="accent">
            <CardHeader title="Top gaps" />
            <ul className="space-y-1.5 text-sm text-navy-700">
              {review.topGaps.map((gap) => (
                <li key={gap} className="flex gap-2">
                  <span className="text-teal-600">•</span>
                  {gap}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card>
          <CardHeader title="Suggested improvements" />
          <ul className="space-y-2 text-sm leading-relaxed text-navy-700">
            {review.suggestedImprovements.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-navy-400">→</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {review.unansweredQuestions.length > 0 ? (
          <Card variant="elevated">
            <CardHeader
              title="Questions to bring with you"
              subtitle="Prepared for expert review — not answered by this tool."
            />
            <ul className="space-y-2 text-sm text-navy-700">
              {review.unansweredQuestions.map((q) => (
                <li key={q} className="rounded-lg bg-mist-50 px-3 py-2">
                  {q}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link
            href={ROUTES.profileResearch(record.id)}
            className="btn-secondary text-sm"
          >
            Open research workspace
          </Link>
          <Link href={ROUTES.afterMeeting} className="btn-ghost text-sm">
            After your meeting →
          </Link>
        </div>
      </div>
    </div>
  );
}
