"use client";

import { PacketSection } from "@/components/ui/design";
import { COACH_COPY } from "@/lib/copy";

const PREVIEW_ACTIONS = [
  {
    label: "What should I strengthen?",
    title: "Information you may want to add",
    bullets: [
      "A simple diagram of how water flows through the filter cartridge",
      "When you first shared the idea publicly, if applicable",
      "What you tested compared with existing bottle filters",
    ],
  },
  {
    label: "What might an expert ask?",
    title: "Questions you may want to prepare for",
    bullets: [
      "What problem does HydroSeal solve compared with pump or UV filters?",
      "What makes the compostable cartridge different from replaceable filters on the market?",
      "Who is the primary user and how do they discover your product?",
    ],
  },
];

export function CoachPreview() {
  return (
    <PacketSection
      kicker="Preparation coach preview"
      title="AI Packet Coach"
      subtitle={COACH_COPY.intro}
      accent="teal"
    >
      <p className="text-xs leading-relaxed text-navy-500">
        Preview only on the sample packet. In a real packet, the coach responds
        to your answers — preparation help only, not legal advice.
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {PREVIEW_ACTIONS.map((action) => (
          <div
            key={action.label}
            className="rounded-2xl border border-dashed border-teal-200/80 bg-white p-5 shadow-[var(--shadow-paper)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {action.label}
            </p>
            <h4 className="mt-2 text-base font-semibold text-navy-900">
              {action.title}
            </h4>
            <ul className="mt-3 space-y-2">
              {action.bullets.map((b) => (
                <li key={b} className="text-sm leading-relaxed text-navy-700">
                  · {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PacketSection>
  );
}
