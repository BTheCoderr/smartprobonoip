"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PaperCard, StampLabel } from "@/components/ui/design";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import {
  AGREEMENT_STATUS_OPTIONS,
  AGREEMENT_TYPE_OPTIONS,
  ASSET_OPTIONS,
  CONTRIBUTOR_HELP_OPTIONS,
  CONTRIBUTOR_INVOLVEMENT_OPTIONS,
  GOAL_OPTIONS,
  IDEA_INCLUDE_OPTIONS,
  INSTITUTION_RELATIONSHIP_OPTIONS,
  ITEM_TYPE_OPTIONS,
  SHARING_OPTIONS,
} from "@/lib/labels";
import { suggestIdeaIncludes } from "@/lib/signals";
import { ownershipInfoCompleted } from "@/lib/ownership";
import { getStore } from "@/lib/store";
import { getStoredTracking } from "@/lib/partnerTracking";
import { pilotSessionHeaders } from "@/lib/pilotSession";
import { trackEvent } from "@/lib/analytics/client";
import { activateDemoFromQuery, DEMO_INVENTION, isDemoMode } from "@/lib/demo";
import { INTAKE_COPY, INTAKE_STEP_LEARN_LINKS, INTAKE_WHY_COPY } from "@/lib/copy";
import {
  REVIEW_FIELDS,
  validateForGeneration,
  validateIntakeStep,
} from "@/lib/intakeValidation";
import type {
  AgreementStatus,
  AgreementType,
  AssetType,
  ContributorHelpType,
  ContributorInvolvement,
  Goal,
  IdeaInclude,
  InstitutionRelationship,
  IntakeAnswers,
  ReadinessProfile,
  SharingChannel,
} from "@/lib/types";
import {
  CheckboxGroup,
  ClarityScale,
  RadioGroup,
  ReviewFieldCard,
  SelectField,
  TextField,
  YesNoField,
} from "./fields";
import { FieldWhyHelper } from "./FieldWhyHelper";

const STEP_LABELS = [
  "Idea basics",
  "How it works",
  "What it includes",
  "Sharing + materials",
  "Support goals",
  "Review",
  "Readiness",
];

const STEP_HINTS: Record<number, string | undefined> = {
  0: "Start with plain language. You can refine the details later.",
  1: "Describe how it works and what makes it different from what already exists.",
  2: "Help us understand the shape of your idea and what it includes.",
  3: "Materials, sharing history, and people who helped prepare your packet.",
  4: "Tell us what kind of support you are looking for.",
  5: "Review your answers before we build your packet.",
  6: "One last check before we build your packet.",
};

const INITIAL: IntakeAnswers = {
  whatCreated: "",
  problemSolved: "",
  whoFor: "",
  howItWorks: "",
  mainParts: "",
  whatDifferent: "",
  itemType: "software",
  hasPrototype: false,
  assets: [],
  sharedChannels: [],
  hasBrandIdentity: false,
  goals: [],
  location: "",
  wantsProBono: false,
  preClarity: 3,
  contributorsInvolved: undefined,
  contributorHelpTypes: [],
  agreementStatus: undefined,
  agreementTypes: [],
  institutionRelationship: undefined,
  ownershipNotes: "",
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function IntakeActions({
  step,
  last,
  canProceed,
  submitting,
  demoActive,
  onBack,
  onNext,
  onSubmit,
}: {
  step: number;
  last: number;
  canProceed: boolean;
  submitting: boolean;
  demoActive: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 border-t border-mist-200 bg-white/95 px-6 py-4 backdrop-blur sm:static sm:mx-0 sm:mb-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={step === 0 || submitting}
          className="btn-ghost disabled:invisible"
        >
          ← Back
        </button>

        {step < last ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="btn-primary min-w-[120px] disabled:cursor-not-allowed disabled:bg-mist-300 disabled:text-navy-500 disabled:shadow-none"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="btn-primary min-w-[160px] disabled:cursor-not-allowed disabled:bg-mist-300 disabled:shadow-none"
          >
            {submitting
              ? "Generating…"
              : demoActive
                ? "Generate demo packet"
                : "Generate my packet"}
          </button>
        )}
      </div>
    </div>
  );
}

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoFromUrl = searchParams.get("demo") === "1";
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>(() => {
    if (typeof window !== "undefined") {
      const active =
        activateDemoFromQuery(`?${searchParams.toString()}`) || isDemoMode();
      return active ? DEMO_INVENTION : INITIAL;
    }
    return demoFromUrl ? DEMO_INVENTION : INITIAL;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const demoActive =
    demoFromUrl ||
    isDemoMode() ||
    answers.whatCreated === DEMO_INVENTION.whatCreated;

  const last = STEP_LABELS.length - 1;
  const stepHint = STEP_HINTS[step];
  const whyCopy = INTAKE_WHY_COPY[step];
  const learnLink = INTAKE_STEP_LEARN_LINKS[step];
  const intakeStarted = useRef(false);
  const ownershipStepTracked = useRef(false);

  useEffect(() => {
    if (step === 3 && !ownershipStepTracked.current) {
      ownershipStepTracked.current = true;
      trackEvent("ownership_step_viewed", { metadata: { demo: demoActive } });
    }
  }, [step, demoActive]);

  useEffect(() => {
    if (step !== 0 || intakeStarted.current) return;
    intakeStarted.current = true;
    trackEvent("intake_started", { metadata: { demo: demoActive } });
  }, [step, demoActive]);

  useEffect(() => {
    trackEvent("intake_step_viewed", {
      metadata: {
        stepNumber: step + 1,
        completionPercent: Math.round(((step + 1) / STEP_LABELS.length) * 100),
        demo: demoActive,
      },
    });
    if (step === 5) {
      trackEvent("intake_review_viewed", { metadata: { demo: demoActive } });
    }
  }, [step, demoActive]);

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

  function goNext() {
    if (demoActive) {
      setStep((s) => Math.min(last, s + 1));
      trackEvent("intake_step_completed", {
        metadata: {
          stepNumber: step + 1,
          stepName: STEP_LABELS[step],
          demo: demoActive,
        },
      });
      return;
    }
    if (step === 5) {
      const validationErrors = validateForGeneration(answers);
      if (validationErrors.length > 0) {
        setFieldError(validationErrors[0].message);
        trackEvent("intake_validation_error", {
          metadata: {
            validationField: validationErrors[0].field,
            demo: demoActive,
          },
        });
        return;
      }
    } else {
      const validation = validateIntakeStep(step, answers);
      if (validation) {
        setFieldError(validation.message);
        trackEvent("intake_validation_error", {
          metadata: {
            validationField: validation.field,
            demo: demoActive,
          },
        });
        return;
      }
    }
    setFieldError(null);
    if (step === 3 && ownershipInfoCompleted(answers)) {
      trackEvent("ownership_info_completed", { metadata: { demo: demoActive } });
    }
    if (
      step === 1 &&
      (!answers.ideaIncludes || answers.ideaIncludes.length === 0)
    ) {
      setAnswers((prev) => ({
        ...prev,
        ideaIncludes: suggestIdeaIncludes(prev),
      }));
    }
    setStep((s) => Math.min(last, s + 1));
    trackEvent("intake_step_completed", {
      metadata: {
        stepNumber: step + 1,
        stepName: STEP_LABELS[step],
        demo: demoActive,
      },
    });
  }

  const canProceed = step !== 0 || answers.whatCreated.trim().length > 0;

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
        route: "/start",
        projectId: record.id,
        metadata: {
          totalSteps: STEP_LABELS.length,
          demo: demoActive,
        },
      });
      if (data.profile.signals.includes("ownership_collaborator")) {
        trackEvent("ownership_signal_triggered", {
          projectId: record.id,
          metadata: { demo: demoActive },
        });
      }
      router.push(`/profile/${record.id}`);
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
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 px-5 py-4 text-sm text-teal-900 shadow-sm">
          <strong>Demo mode:</strong> Sample invention loaded — click through or
          edit, then generate your packet.
        </div>
      ) : null}

      <ProgressIndicator steps={STEP_LABELS} current={step} />
      <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-blue">
        {INTAKE_COPY.builderProgress} · Step {step + 1} of {STEP_LABELS.length}
      </p>

      <PaperCard elevated className="overflow-hidden p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-mist-200 pb-5">
          <div>
            <StampLabel tone="aqua">PREP PACKET</StampLabel>
            <h2 className="mt-3 text-lg font-semibold text-navy-900">
              {STEP_LABELS[step]}
            </h2>
          </div>
          <span className="document-tab">{INTAKE_COPY.builderTitle}</span>
        </div>
        {step !== 5 ? (
          <>
            {stepHint ? (
              <p className="mb-4 rounded-xl bg-mist-50 px-4 py-3 text-sm leading-relaxed text-navy-600">
                {stepHint}
              </p>
            ) : null}
            {whyCopy ? (
              <div className="mb-6 rounded-xl border border-navy-100 bg-teal-50/60 px-4 py-4 text-sm leading-relaxed text-navy-700">
                <p className="font-semibold text-navy-900">Why this matters</p>
                <p className="mt-2">{whyCopy.why}</p>
                <p className="mt-3 text-xs text-navy-600">{whyCopy.example}</p>
                {whyCopy.reminder ? (
                  <p className="mt-3 text-xs font-medium text-navy-500">
                    {whyCopy.reminder}
                  </p>
                ) : null}
              </div>
            ) : null}
            {learnLink ? (
              <Link
                href={learnLink.href}
                className="mb-4 inline-flex text-sm font-medium text-navy-600 hover:text-navy-800 hover:underline"
              >
                {learnLink.label} →
              </Link>
            ) : null}
          </>
        ) : (
          <div className="mb-8 rounded-2xl border border-dashed border-teal-200 bg-gradient-to-br from-teal-50/60 to-white px-5 py-5 shadow-[var(--shadow-paper)]">
            <StampLabel tone="teal">PACKET PREVIEW</StampLabel>
            <h2 className="mt-3 text-xl font-semibold text-navy-900">
              {INTAKE_COPY.reviewTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {INTAKE_COPY.reviewSubcopy}
            </p>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-8">
            <FieldWhyHelper fieldKey="whatCreated" />
            <TextField
              label="What did you create?"
              hint="Describe it in plain language — no jargon needed."
              value={answers.whatCreated}
              onChange={(v) => update("whatCreated", v)}
              placeholder="e.g. A reusable water bottle that filters as you drink."
            />
            <FieldWhyHelper fieldKey="problemSolved" />
            <TextField
              label="What problem does it solve?"
              value={answers.problemSolved}
              onChange={(v) => update("problemSolved", v)}
            />
            <FieldWhyHelper fieldKey="whoFor" />
            <TextField
              label="Who is it for?"
              value={answers.whoFor}
              onChange={(v) => update("whoFor", v)}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <FieldWhyHelper fieldKey="howItWorks" />
            <TextField
              label="How does it work?"
              value={answers.howItWorks}
              onChange={(v) => update("howItWorks", v)}
            />
            <FieldWhyHelper fieldKey="mainParts" />
            <TextField
              label="What are the main parts or components?"
              value={answers.mainParts}
              onChange={(v) => update("mainParts", v)}
            />
            <FieldWhyHelper fieldKey="whatDifferent" />
            <TextField
              label="What makes it different from what already exists?"
              value={answers.whatDifferent}
              onChange={(v) => update("whatDifferent", v)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <FieldWhyHelper fieldKey="itemType" />
            <SelectField
              label="What kind of thing is it?"
              value={answers.itemType}
              options={ITEM_TYPE_OPTIONS}
              onChange={(v) => update("itemType", v)}
            />
            <FieldWhyHelper fieldKey="hasPrototype" />
            <YesNoField
              label="Do you have a prototype?"
              value={answers.hasPrototype}
              onChange={(v) => update("hasPrototype", v)}
            />
            <FieldWhyHelper fieldKey="hasBrandIdentity" />
            <YesNoField
              label="Do you have a name, logo, slogan, or brand identity?"
              value={answers.hasBrandIdentity}
              onChange={(v) => update("hasBrandIdentity", v)}
            />
            <CheckboxGroup<IdeaInclude>
              label="What does your idea include?"
              hint="Optional — check anything that fits. We use this to suggest what your packet may touch."
              options={IDEA_INCLUDE_OPTIONS}
              selected={answers.ideaIncludes ?? []}
              onToggle={(v) =>
                update("ideaIncludes", toggle(answers.ideaIncludes ?? [], v))
              }
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <FieldWhyHelper fieldKey="assets" />
            <CheckboxGroup<AssetType>
              label="Which materials do you already have?"
              hint="Select all that apply."
              options={ASSET_OPTIONS}
              selected={answers.assets}
              onToggle={(v) => update("assets", toggle(answers.assets, v))}
            />
            <FieldWhyHelper fieldKey="sharedChannels" />
            <CheckboxGroup<SharingChannel>
              label="Have you shared it anywhere?"
              hint="This helps us flag possible public disclosure."
              options={SHARING_OPTIONS}
              selected={answers.sharedChannels}
              onToggle={toggleSharing}
            />

            <div className="rounded-2xl border border-dashed border-mist-200 bg-cream/50 p-5">
              <p className="section-kicker text-teal-700">
                {INTAKE_COPY.ownershipSectionTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                {INTAKE_COPY.ownershipSectionHint}
              </p>
              <div className="mt-6 space-y-8">
                <RadioGroup<ContributorInvolvement>
                  label="Did anyone else help create, design, build, code, test, fund, or document this idea?"
                  options={CONTRIBUTOR_INVOLVEMENT_OPTIONS}
                  value={answers.contributorsInvolved}
                  onChange={(v) => update("contributorsInvolved", v)}
                />
                {answers.contributorsInvolved &&
                answers.contributorsInvolved !== "solo" ? (
                  <CheckboxGroup<ContributorHelpType>
                    label="What did they help with?"
                    options={CONTRIBUTOR_HELP_OPTIONS}
                    selected={answers.contributorHelpTypes ?? []}
                    onToggle={(v) =>
                      update(
                        "contributorHelpTypes",
                        toggle(answers.contributorHelpTypes ?? [], v),
                      )
                    }
                  />
                ) : null}
                <RadioGroup<AgreementStatus>
                  label="Do you have written agreements with anyone who helped?"
                  options={AGREEMENT_STATUS_OPTIONS}
                  value={answers.agreementStatus}
                  onChange={(v) => update("agreementStatus", v)}
                />
                {answers.agreementStatus === "yes" ||
                answers.agreementStatus === "not_sure" ? (
                  <CheckboxGroup<AgreementType>
                    label="What agreement types might exist?"
                    options={AGREEMENT_TYPE_OPTIONS}
                    selected={answers.agreementTypes ?? []}
                    onToggle={(v) =>
                      update(
                        "agreementTypes",
                        toggle(answers.agreementTypes ?? [], v),
                      )
                    }
                  />
                ) : null}
                <RadioGroup<InstitutionRelationship>
                  label="Was any part created through an employer, school, grant, client project, or paid contractor relationship?"
                  options={INSTITUTION_RELATIONSHIP_OPTIONS}
                  value={answers.institutionRelationship}
                  onChange={(v) => update("institutionRelationship", v)}
                />
                <TextField
                  label="Anything you want to remember about who helped or what agreements exist?"
                  hint="Optional — for your own notes in the packet."
                  value={answers.ownershipNotes ?? ""}
                  onChange={(v) => update("ownershipNotes", v)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <FieldWhyHelper fieldKey="goals" />
            <CheckboxGroup<Goal>
              label="What are you looking for?"
              hint="Select all that apply."
              options={GOAL_OPTIONS}
              selected={answers.goals}
              onToggle={(v) => update("goals", toggle(answers.goals, v))}
            />
            <FieldWhyHelper fieldKey="location" />
            <TextField
              label="What is your location?"
              hint="City / state / country — used to suggest local resources."
              value={answers.location}
              onChange={(v) => update("location", v)}
              rows={1}
            />
            <YesNoField
              label="Are you interested in low-cost or pro bono support?"
              value={answers.wantsProBono}
              onChange={(v) => update("wantsProBono", v)}
            />
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {REVIEW_FIELDS.map(({ key, label }) => (
              <ReviewFieldCard
                key={key}
                label={label}
                value={String(answers[key] ?? "")}
                onChange={(v) => update(key, v)}
                rows={
                  key === "whatCreated" || key === "howItWorks" ? 4 : 3
                }
              />
            ))}
            <div className="rounded-2xl border border-mist-200/80 bg-mist-50/50 p-5 shadow-sm sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                What your idea includes
              </p>
              <p className="mt-3 text-sm leading-relaxed text-navy-700">
                {(answers.ideaIncludes ?? []).length > 0
                  ? (answers.ideaIncludes ?? [])
                      .map(
                        (v) =>
                          IDEA_INCLUDE_OPTIONS.find((o) => o.value === v)
                            ?.label ?? v,
                      )
                      .join(" · ")
                  : "None selected — you can go back to step 3 to add these."}
              </p>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <ClarityScale
              label="Before we generate your profile: how clear are you on your next IP step?"
              value={answers.preClarity}
              onChange={(v) => update("preClarity", v)}
            />
            <p className="rounded-2xl bg-mist-50 px-5 py-4 text-sm leading-relaxed text-navy-600">
              We&rsquo;ll ask you again after you see your packet so we can
              measure how much clearer you feel.
            </p>
          </div>
        )}

        {fieldError ? (
          <p
            className="mt-6 rounded-xl border border-aqua-200 bg-aqua-50 px-4 py-3 text-sm text-navy-900"
            role="alert"
          >
            {fieldError}
          </p>
        ) : null}

        {error ? (
          <p
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <IntakeActions
          step={step}
          last={last}
          canProceed={canProceed}
          submitting={submitting}
          demoActive={demoActive}
          onBack={() => setStep((s) => Math.max(0, s - 1))}
          onNext={goNext}
          onSubmit={handleSubmit}
        />
      </PaperCard>
    </div>
  );
}
