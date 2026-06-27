import { Card, CardHeader } from "@/components/ui/Card";
import { ROUTING_COPY } from "@/lib/copy";
import {
  buildRoutedResources,
  type RoutedResourceCard,
} from "@/lib/resourceRouting";
import type { PilotFeedbackInput } from "@/lib/feedback";
import type { ProjectRecord } from "@/lib/types";

export function ResourceRoutingCards({
  record,
  feedback,
}: {
  record: ProjectRecord;
  feedback: PilotFeedbackInput | null;
}) {
  const cards = buildRoutedResources(record, feedback?.supportNeeded ?? []);

  if (cards.length === 0) return null;

  return (
    <Card>
      <CardHeader
        title={ROUTING_COPY.title}
        subtitle={ROUTING_COPY.subtitle}
      />
      <p className="text-sm leading-relaxed text-navy-600">{ROUTING_COPY.safety}</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <ResourceCard key={card.id} card={card} />
        ))}
      </ul>
    </Card>
  );
}

function ResourceCard({ card }: { card: RoutedResourceCard }) {
  return (
    <li className="rounded-2xl border border-mist-200/80 bg-gradient-to-br from-white to-mist-50 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
        Next resource type
      </p>
      <h3 className="mt-2 text-base font-semibold text-navy-900">{card.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-600">
        This {card.lead}.
      </p>
      {card.reasons.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-navy-500">
          {card.reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
