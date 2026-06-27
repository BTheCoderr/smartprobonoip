import { Card, CardHeader } from "@/components/ui/Card";
import type { MiniPrepSection } from "@/lib/miniPrepSections";

export function MiniPrepSectionCard({ section }: { section: MiniPrepSection }) {
  return (
    <Card variant="elevated">
      <CardHeader title={section.title} subtitle={section.subtitle} />
      <div className="space-y-5 text-sm leading-relaxed text-navy-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Why this may matter
          </p>
          <p className="mt-1.5">{section.whyItMatters}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            What to gather
          </p>
          <ul className="mt-2 space-y-1.5">
            {section.whatToGather.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-teal-600">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {section.personalizedNotes && section.personalizedNotes.length > 0 ? (
          <dl className="space-y-3 rounded-xl border border-mist-200/80 bg-mist-50/60 p-4">
            {section.personalizedNotes.map((note) => (
              <div key={note.label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                  {note.label}
                </dt>
                <dd className="mt-1">{note.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Questions to ask
          </p>
          <ul className="mt-3 space-y-2">
            {section.questionsToAsk.map((q) => (
              <li
                key={q}
                className="rounded-lg border border-mist-200/80 bg-mist-50/60 px-4 py-3"
              >
                {q}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Suggested resource type
          </p>
          <p className="mt-1.5">{section.suggestedResourceType}</p>
        </div>
        <p className="text-xs leading-relaxed text-navy-500">{section.disclaimer}</p>
      </div>
    </Card>
  );
}
