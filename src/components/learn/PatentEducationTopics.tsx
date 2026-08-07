"use client";

import { PATENT_EDUCATION_TOPICS } from "@/lib/paths/patent/education";

/** Patent-path education panel for Learn and related surfaces. */
export function PatentEducationTopics() {
  return (
    <div className="space-y-4">
      <div>
        <p className="section-kicker text-teal-700">Patent readiness education</p>
        <h3 className="mt-2 text-lg font-semibold text-navy-900">
          Privacy, inventorship, and disclosure basics
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">
          Phase 1 education for inventor preparedness — not legal advice or
          inventorship determinations.
        </p>
      </div>
      <div className="space-y-3">
        {PATENT_EDUCATION_TOPICS.map((topic) => (
          <details
            key={topic.id}
            className="rounded-xl border border-mist-200 bg-white px-4 py-3"
          >
            <summary className="cursor-pointer text-sm font-semibold text-navy-900">
              {topic.title}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {topic.summary}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-navy-700">
              {topic.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="text-teal-500">•</span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-navy-500">
              {topic.safetyNote}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
