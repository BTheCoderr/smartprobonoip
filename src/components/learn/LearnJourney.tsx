"use client";

import { useState } from "react";
import Link from "next/link";
import { LEARN_COPY } from "@/lib/copy";
import { ROUTES } from "@/lib/routes";

export function LearnJourney() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-8">
      <div className="paper-card px-5 py-5 sm:px-6">
        <p className="section-kicker">Phase 1 of your journey</p>
        <h2 className="mt-2 text-xl font-bold text-navy-900">{LEARN_COPY.journeyTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">{LEARN_COPY.journeyLead}</p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-4">
          {LEARN_COPY.journeySteps.map((step, i) => (
            <li
              key={step.label}
              className={`rounded-lg border px-3 py-3 text-sm ${
                i === 0
                  ? "border-navy-200 bg-teal-50/60"
                  : "border-mist-200 bg-white"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-navy-500">
                {step.phase}
              </span>
              <p className="mt-1 font-semibold text-navy-900">{step.label}</p>
              <p className="mt-1 text-xs text-navy-600">{step.hint}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={ROUTES.disclaimer} className="btn-primary text-sm">
            Start your readiness packet
          </Link>
          <Link href={ROUTES.sample} className="btn-secondary text-sm">
            View sample packet
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {LEARN_COPY.modules.map((module, index) => {
          const open = openIndex === index;
          return (
            <div key={module.id} className="paper-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6"
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-500">
                    Module {index + 1}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-navy-900">
                    {module.title}
                  </h3>
                </div>
                <span className="text-navy-400">{open ? "−" : "+"}</span>
              </button>
              {open ? (
                <div className="border-t border-dashed border-mist-200 px-5 pb-5 sm:px-6">
                  <p className="pt-4 text-sm leading-relaxed text-navy-700">{module.body}</p>
                  <p className="mt-3 rounded-lg bg-teal-50/70 px-3 py-2 text-xs leading-relaxed text-navy-600">
                    {module.example}
                  </p>
                  {'keyPoints' in module && module.keyPoints.length > 0 ? (
                    <ul className="mt-4 space-y-1 text-sm text-navy-700">
                      {module.keyPoints.map((point) => (
                        <li key={point} className="flex gap-2">
                          <span className="text-navy-400">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link
                    href={
                      'ctaHref' in module && module.ctaHref
                        ? module.ctaHref
                        : ROUTES.disclaimer
                    }
                    className="btn-ghost mt-4 px-0 text-sm"
                  >
                    {'ctaLabel' in module && module.ctaLabel
                      ? module.ctaLabel
                      : "Continue to packet builder →"}
                  </Link>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
