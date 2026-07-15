"use client";

import { WIZARD_STEPS } from "@/lib/intake/wizardConfig";

export function IntakeWizardNav({
  step,
  last,
  canProceed,
  submitting,
  demoActive,
  skippable,
  onBack,
  onNext,
  onSkip,
  onSaveAndExit,
  onSubmit,
}: {
  step: number;
  last: number;
  canProceed: boolean;
  submitting: boolean;
  demoActive: boolean;
  skippable: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onSaveAndExit: () => void;
  onSubmit: () => void;
}) {
  const isLast = step >= last;

  return (
    <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 border-t border-mist-200 bg-white/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:mb-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
      <div className="mb-3 flex justify-center sm:justify-start">
        <button
          type="button"
          onClick={onSaveAndExit}
          disabled={submitting}
          className="btn-ghost text-xs text-teal-700 sm:text-sm"
        >
          Save &amp; continue later
        </button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={step === 0 || submitting}
          className="btn-ghost order-2 sm:order-1 disabled:invisible"
        >
          ← Back
        </button>

        <div className="order-1 flex flex-col gap-2 sm:order-2 sm:flex-row sm:justify-end">
          {skippable && !isLast ? (
            <button
              type="button"
              onClick={onSkip}
              disabled={submitting}
              className="btn-secondary w-full sm:w-auto"
            >
              Skip for now
            </button>
          ) : null}
          {!isLast ? (
            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed || submitting}
              className="btn-primary-lg w-full sm:w-auto disabled:cursor-not-allowed disabled:bg-mist-300 disabled:text-navy-500 disabled:shadow-none"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="btn-primary-lg w-full sm:w-auto disabled:cursor-not-allowed disabled:bg-mist-300 disabled:shadow-none"
            >
              {submitting
                ? "Generating your packet…"
                : demoActive
                  ? "Generate demo packet"
                  : "Generate my packet"}
            </button>
          )}
        </div>
      </div>
      {WIZARD_STEPS[step]?.skippable && !isLast ? (
        <p className="mt-2 text-center text-[11px] text-navy-500 sm:text-left">
          Optional step — skip anytime and fill in more detail in your packet later.
        </p>
      ) : null}
    </div>
  );
}
