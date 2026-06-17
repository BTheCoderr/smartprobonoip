import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import {
  RESOURCE_DESCRIPTIONS,
  RESOURCE_LABELS,
  SIGNAL_DESCRIPTIONS,
  SIGNAL_LABELS,
} from "@/lib/labels";
import type { ReadinessProfile } from "@/lib/types";

export function ProfileView({ profile }: { profile: ReadinessProfile }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Plain-language summary" />
        <p className="text-navy-700">{profile.ideaSummary}</p>
      </Card>

      <Card
        className={
          profile.publicDisclosure ? "border-amber-300 bg-amber-50" : undefined
        }
      >
        <CardHeader
          title="Public sharing / disclosure flag"
          subtitle={
            profile.publicDisclosure
              ? "Possible public disclosure detected"
              : "No public disclosure indicated"
          }
        />
        <p className="text-sm text-navy-700">{profile.publicDisclosureNote}</p>
      </Card>

      <Card>
        <CardHeader
          title="Possible IP category signals"
          subtitle="These are starting points, not conclusions."
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {profile.signals.map((s) => (
            <Badge key={s} tone="navy">
              {SIGNAL_LABELS[s]}
            </Badge>
          ))}
        </div>
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
          <CardHeader title="What information is missing" />
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

      <Card className="border-teal-200 bg-teal-50">
        <CardHeader title="Suggested next step" />
        <p className="text-navy-800">{profile.suggestedNextStep}</p>
      </Card>

      <Card>
        <CardHeader title="Questions to bring to an expert" />
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
          title="Recommended resource categories"
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

      <DisclaimerNotice />
    </div>
  );
}
