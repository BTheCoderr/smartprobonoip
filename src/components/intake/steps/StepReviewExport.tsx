import { INTAKE_COPY } from "@/lib/copy";
import { getEducationCards } from "@/lib/content/educationCards";
import { READINESS_CHECKLIST, WIZARD_STEPS } from "@/lib/intake/wizardConfig";
import { REVIEW_FIELDS } from "@/lib/intakeValidation";
import { IDEA_INCLUDE_OPTIONS } from "@/lib/labels";
import type { IntakeAnswers } from "@/lib/types";
import { EducationCardList } from "@/components/ui/EducationCard";
import { ClarityScale, ReviewFieldCard } from "../fields";

export function StepReviewExport({
  answers,
  onUpdate,
  onGoToStep,
}: {
  answers: IntakeAnswers;
  onUpdate: <K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) => void;
  onGoToStep?: (step: number) => void;
}) {
  const editSteps = WIZARD_STEPS.slice(0, -1);

  return (
    <div className="space-y-8">
      <div className="rounded-md border border-dashed border-teal-200 bg-gradient-to-br from-teal-50/50 to-white px-4 py-4 sm:px-5 sm:py-5">
        <p className="section-kicker text-teal-700">Readiness checklist</p>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">
          {INTAKE_COPY.reviewSubcopy}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {READINESS_CHECKLIST.map((item) => (
            <li
              key={item}
              className="flex gap-2 rounded-md border border-mist-200/80 bg-white/80 px-3 py-2 text-sm text-navy-700"
            >
              <span className="shrink-0 text-teal-600">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {onGoToStep ? (
          <div className="mt-4 border-t border-dashed border-teal-200/80 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              Jump back to edit a step
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {editSteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onGoToStep(index)}
                  className="rounded-md border border-mist-200 bg-white px-3 py-1.5 text-xs font-medium text-teal-800 hover:border-teal-300 hover:bg-teal-50"
                >
                  {index + 1}. {step.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {REVIEW_FIELDS.map(({ key, label }) => (
          <ReviewFieldCard
            key={key}
            label={label}
            value={String(answers[key] ?? "")}
            onChange={(v) => onUpdate(key, v)}
            rows={key === "whatCreated" || key === "howItWorks" ? 4 : 3}
          />
        ))}
      </div>

      <div className="rounded-md border border-mist-200 bg-mist-50/50 px-4 py-4 sm:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          What your idea includes
        </p>
        <p className="mt-2 text-sm leading-relaxed text-navy-700">
          {(answers.ideaIncludes ?? []).length > 0
            ? (answers.ideaIncludes ?? [])
                .map(
                  (v) =>
                    IDEA_INCLUDE_OPTIONS.find((o) => o.value === v)?.label ?? v,
                )
                .join(" · ")
            : "None selected — optional."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="dossier-card px-4 py-4">
          <p className="text-sm font-semibold text-navy-900">PDF handoff</p>
          <p className="mt-1 text-xs leading-relaxed text-navy-600">
            Download a structured packet immediately after generation.
          </p>
        </div>
        <div className="dossier-card border-teal-200/80 bg-teal-50/30 px-4 py-4">
          <p className="text-sm font-semibold text-navy-900">Export for Attorney</p>
          <p className="mt-1 text-xs leading-relaxed text-navy-600">
            PDF, JSON, or CSV with disclaimer — available on your packet page after
            generation. Preparation only, not legal advice.
          </p>
        </div>
      </div>

      <EducationCardList
        title="Quick explainer"
        cards={getEducationCards(["fee_status"])}
      />

      <ClarityScale
        label="How clear are you on your next IP step right now?"
        value={answers.preClarity}
        onChange={(v) => onUpdate("preClarity", v)}
      />
      <p className="text-sm leading-relaxed text-navy-500">
        We will ask again after you see your packet to measure clarity lift.
      </p>
    </div>
  );
}
