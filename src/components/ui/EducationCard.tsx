import type { EducationCardContent } from "@/lib/types";

export function EducationCard({ card }: { card: EducationCardContent }) {
  return (
    <details className="group rounded-xl border border-mist-200 bg-white/80">
      <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-navy-800">
            {card.title}
          </span>
          <span
            aria-hidden
            className="text-xs text-teal-700 transition group-open:rotate-90"
          >
            ›
          </span>
        </span>
      </summary>
      <div className="border-t border-dashed border-mist-200 px-4 py-3">
        <p className="text-sm leading-relaxed text-navy-700">
          {card.shortAnswer}
        </p>
        {card.detail ? (
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            {card.detail}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-navy-500">
          Preparation only — not legal advice.
        </p>
      </div>
    </details>
  );
}

export function EducationCardList({
  cards,
  title,
}: {
  cards: EducationCardContent[];
  title?: string;
}) {
  if (cards.length === 0) return null;
  return (
    <div>
      {title ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
          {title}
        </p>
      ) : null}
      <div className="space-y-2">
        {cards.map((card) => (
          <EducationCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
