"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaperCard, StampLabel } from "@/components/ui/design";
import { IntakeWizardNav } from "@/components/intake/IntakeWizardNav";
import { IntakeWizardProgress } from "@/components/intake/IntakeWizardProgress";
import { StepMaterialsPrototype } from "@/components/intake/steps/StepMaterialsPrototype";
import { StepReviewExport } from "@/components/intake/steps/StepReviewExport";
import { StepSearchPrep } from "@/components/intake/steps/StepSearchPrep";
import { StepTimelineDisclosures } from "@/components/intake/steps/StepTimelineDisclosures";
import { StepYourIdea } from "@/components/intake/steps/StepYourIdea";
import { IntakePacketPreview } from "@/components/intake/IntakePacketPreview";
import { suggestIdeaIncludes } from "@/lib/signals";
import { ownershipInfoCompleted } from "@/lib/ownership";
import { getStore } from "@/lib/store";
import { getStoredTracking } from "@/lib/partnerTracking";
import { pilotSessionHeaders } from "@/lib/pilotSession";
import { trackEvent } from "@/lib/analytics/client";
import { activateDemoFromQuery, DEMO_INVENTION, isDemoMode } from "@/lib/demo";
import { INTAKE_COPY } from "@/lib/copy";
import {
  clearIntakeDraft,
  loadIntakeDraft,
  saveIntakeDraft,
} from "@/lib/intake/draftStorage";
import {
  validateWizardStep,
  WIZARD_STEPS,
} from "@/lib/intake/wizardConfig";
import { validateForGeneration } from "@/lib/intakeValidation";
import type {
  IntakeAnswers,
  ReadinessProfile,
  SharingChannel,
} from "@/lib/types";

const INITIAL: IntakeAnswers = {
  whatCreated: "",
  problemSolved: "",
  whoFor: "",
  howItWorks: "",
  mainParts: "",
  whatDifferent: "",
  itemType: "physical_product",
  hasPrototype: false,
  assets: [],
  sharedChannels: [],
  hasBrandIdentity: false,
  goals: ["expert_review"],
  location: "",
  wantsProBono: false,
  preClarity: 3,
  contributorsInvolved: undefined,
  contributorHelpTypes: [],
  agreementStatus: undefined,
  agreementTypes: [],
  institutionRelationship: undefined,
  ownershipNotes: "",
  brandName: "",
  searchReadiness: undefined,
  disclosureEvents: [],
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function applySmartDefaults(answers: IntakeAnswers, step: number): IntakeAnswers {
  const next = { ...answers };
  if (step === 0 && (!next.ideaIncludes || next.ideaIncludes.length === 0)) {
    next.ideaIncludes = suggestIdeaIncludes(next);
  }
  if (step === 1) {
    if (next.sharedChannels.length === 0) {
      next.sharedChannels = ["none"];
    }
    if (!next.contributorsInvolved) {
      next.contributorsInvolved = "solo";
    }
    if (!next.agreementStatus) {
      next.agreementStatus = "not_applicable";
    }
    if (!next.institutionRelationship) {
      next.institutionRelationship = "no";
    }
  }
  return next;
}

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoFromUrl = searchParams.get("demo") === "1";
  const last = WIZARD_STEPS.length - 1;

  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 0;
    if (demoFromUrl || isDemoMode()) return 0;
    const draft = loadIntakeDraft();
    if (draft?.answers.whatCreated.trim()) {
      return Math.min(draft.step, last);
    }
    return 0;
  });

  const [answers, setAnswers] = useState<IntakeAnswers>(() => {
    if (typeof window !== "undefined") {
      const active =
        activateDemoFromQuery(`?${searchParams.toString()}`) || isDemoMode();
      if (active) return DEMO_INVENTION;
      const draft = loadIntakeDraft();
      if (draft?.answers.whatCreated.trim()) return draft.answers;
      return INITIAL;
    }
    return demoFromUrl ? DEMO_INVENTION : INITIAL;
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(() => {
    if (typeof window === "undefined") return false;
    if (demoFromUrl || isDemoMode()) return false;
    const draft = loadIntakeDraft();
    return Boolean(draft?.answers.whatCreated.trim());
  });
  const [savedExitMessage, setSavedExitMessage] = useState<string | null>(null);
  const [previewDismissed, setPreviewDismissed] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intakeStarted = useRef(false);
  const ownershipStepTracked = useRef(false);

  const demoActive =
    demoFromUrl ||
    isDemoMode() ||
    answers.whatCreated === DEMO_INVENTION.whatCreated;

  const currentStep = WIZARD_STEPS[step];
  const canProceed =
    step !== 0 ||
    (answers.whatCreated.trim().length > 0 &&
      answers.whoFor.trim().length > 0 &&
      answers.howItWorks.trim().length >= 12);

  const showPacketPreview =
    step >= 1 &&
    !previewDismissed &&
    answers.whatCreated.trim().length > 0;

  useEffect(() => {
    if (step === 1 && !ownershipStepTracked.current) {
      ownershipStepTracked.current = true;
      trackEvent("ownership_step_viewed", { metadata: { demo: demoActive } });
    }
  }, [step, demoActive]);

  useEffect(() => {
    if (demoActive || submitting) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!answers.whatCreated.trim() && step === 0) return;
      saveIntakeDraft({
        answers,
        step,
        savedAt: new Date().toISOString(),
      });
      setSaveStatus(INTAKE_COPY.draftSaved);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [answers, step, demoActive, submitting]);

  useEffect(() => {
    if (step !== 0 || intakeStarted.current) return;
    intakeStarted.current = true;
    trackEvent("intake_started", { metadata: { demo: demoActive } });
  }, [step, demoActive]);

  useEffect(() => {
    trackEvent("intake_step_viewed", {
      metadata: {
        stepNumber: step + 1,
        stepName: currentStep.label,
        completionPercent: Math.round(((step + 1) / WIZARD_STEPS.length) * 100),
        demo: demoActive,
      },
    });
    if (step === last) {
      trackEvent("intake_review_viewed", { metadata: { demo: demoActive } });
    }
  }, [step, demoActive, currentStep.label, last]);

  function update<K extends keyof IntakeAnswers>(
    key: K,
    value: IntakeAnswers[K],
  ) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setFieldError(null);
  }

  function toggleSharing(value: SharingChannel) {
    setAnswers((prev) => {
      if (value === "none") return { ...prev, sharedChannels: ["none"] };
      const without = prev.sharedChannels.filter((c) => c !== "none");
      return { ...prev, sharedChannels: toggle(without, value) };
    });
  }

  function advanceStep(nextStep: number) {
    setStep(nextStep);
    trackEvent("intake_step_completed", {
      metadata: {
        stepNumber: step + 1,
        stepName: currentStep.label,
        demo: demoActive,
      },
    });
  }

  function validateCurrentStep(): boolean {
    if (demoActive) return true;
    const validation = validateWizardStep(step, answers);
    if (validation) {
      setFieldError(validation.message);
      trackEvent("intake_validation_error", {
        metadata: {
          validationField: validation.field,
          demo: demoActive,
        },
      });
      return false;
    }
    setFieldError(null);
    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;

    const nextAnswers = applySmartDefaults(answers, step);
    setAnswers(nextAnswers);

    if (step === 1 && ownershipInfoCompleted(nextAnswers)) {
      trackEvent("ownership_info_completed", { metadata: { demo: demoActive } });
    }

    advanceStep(Math.min(last, step + 1));
  }

  function goSkip() {
    const nextAnswers = applySmartDefaults(answers, step);
    setAnswers(nextAnswers);
    setFieldError(null);
    advanceStep(Math.min(last, step + 1));
  }

  function saveAndExit() {
    saveIntakeDraft({
      answers,
      step,
      savedAt: new Date().toISOString(),
    });
    setSavedExitMessage(INTAKE_COPY.saveAndExit);
    trackEvent("intake_draft_saved", {
      metadata: { stepNumber: step + 1, demo: demoActive },
    });
    window.setTimeout(() => {
      router.push("/smartprobonoip");
    }, 900);
  }

  async function handleSubmit() {
    if (!demoActive) {
      const validationErrors = validateForGeneration(answers);
      if (validationErrors.length > 0) {
        setFieldError(validationErrors[0].message);
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    setFieldError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...pilotSessionHeaders(),
        },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(err.error ?? "Generation failed");
      }
      const data = (await res.json()) as { profile: ReadinessProfile };
      const record = await getStore().saveRecord({
        answers,
        profile: data.profile,
        preClarity: answers.preClarity,
        isDemo: demoActive,
        tracking: demoActive ? null : getStoredTracking(),
      });
      trackEvent("intake_completed", {
        route: "/smartprobonoip/start",
        projectId: record.id,
        metadata: {
          totalSteps: WIZARD_STEPS.length,
          demo: demoActive,
        },
      });
      clearIntakeDraft();
      if (data.profile.signals.includes("ownership_collaborator")) {
        trackEvent("ownership_signal_triggered", {
          projectId: record.id,
          metadata: { demo: demoActive },
        });
      }
      router.push(`/smartprobonoip/profile/${record.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong generating your profile. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {demoActive ? (
        <div className="rounded-md border border-teal-200 bg-teal-50/80 px-4 py-3 text-sm text-teal-900">
          <strong>Demo mode:</strong> Sample invention loaded — walk through the
          wizard or edit fields, then generate your packet.
        </div>
      ) : null}

      {draftRestored && !demoActive ? (
        <div className="flex items-start justify-between gap-3 rounded-md border border-teal-200 bg-teal-50/80 px-4 py-3 text-sm text-teal-900">
          <span>{INTAKE_COPY.draftRestored}</span>
          <button
            type="button"
            onClick={() => setDraftRestored(false)}
            className="shrink-0 text-xs font-medium text-teal-700 hover:text-teal-900"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {savedExitMessage ? (
        <p className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          {savedExitMessage}
        </p>
      ) : null}

      <IntakeWizardProgress current={step} saveStatus={saveStatus} />

      <PaperCard elevated className="overflow-hidden p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-mist-200 pb-5">
          <div>
            <StampLabel tone="warm">WIZARD</StampLabel>
            <h2 className="headline-editorial mt-2 text-xl text-navy-900 sm:text-2xl">
              {currentStep.label}
            </h2>
          </div>
          <span className="document-tab">{INTAKE_COPY.builderTitle}</span>
        </div>

        <p className="mb-6 rounded-md bg-mist-50/80 px-4 py-3 text-sm leading-relaxed text-navy-600">
          {currentStep.hint}
        </p>

        {showPacketPreview ? (
          <div className="mb-6">
            <IntakePacketPreview
              answers={answers}
              onDismiss={() => setPreviewDismissed(true)}
            />
          </div>
        ) : null}

        {step === 0 ? (
          <StepYourIdea answers={answers} onUpdate={update} />
        ) : null}
        {step === 1 ? (
          <StepTimelineDisclosures
            answers={answers}
            onUpdate={update}
            onToggleSharing={toggleSharing}
          />
        ) : null}
        {step === 2 ? (
          <StepMaterialsPrototype answers={answers} onUpdate={update} />
        ) : null}
        {step === 3 ? (
          <StepSearchPrep answers={answers} onUpdate={update} />
        ) : null}
        {step === 4 ? (
          <StepReviewExport
            answers={answers}
            onUpdate={update}
            onGoToStep={(target) => {
              setFieldError(null);
              setStep(target);
            }}
          />
        ) : null}

        {fieldError ? (
          <p
            className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            {fieldError}
          </p>
        ) : null}

        {error ? (
          <p
            className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <IntakeWizardNav
          step={step}
          last={last}
          canProceed={canProceed}
          submitting={submitting}
          demoActive={demoActive}
          skippable={currentStep.skippable}
          onBack={() => setStep((s) => Math.max(0, s - 1))}
          onNext={goNext}
          onSkip={goSkip}
          onSaveAndExit={saveAndExit}
          onSubmit={handleSubmit}
        />
      </PaperCard>
    </div>
  );
}
