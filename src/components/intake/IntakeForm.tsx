"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import {
  ASSET_OPTIONS,
  GOAL_OPTIONS,
  IDEA_INCLUDE_OPTIONS,
  ITEM_TYPE_OPTIONS,
  SHARING_OPTIONS,
} from "@/lib/labels";
import { suggestIdeaIncludes } from "@/lib/signals";
import { getStore } from "@/lib/store";
import { activateDemoFromQuery, DEMO_INVENTION, isDemoMode } from "@/lib/demo";
import { INTAKE_COPY } from "@/lib/copy";
import {
  REVIEW_FIELDS,
  validateForGeneration,
  validateIntakeStep,
} from "@/lib/intakeValidation";
import type {
  AssetType,
  Goal,
  IdeaInclude,
  IntakeAnswers,
  ReadinessProfile,
  SharingChannel,
} from "@/lib/types";
import {
  CheckboxGroup,
  ClarityScale,
  ReviewFieldCard,
  SelectField,
  TextField,
  YesNoField,
} from "./fields";

const STEP_LABELS = [
  "Your idea",
  "How it works",
  "Type & prototype",
  "Materials & sharing",
  "Goals & support",
  "Review your answers",
  "Readiness",
];

const STEP_HINTS: Record<number, string | undefined> = {
  0: "Start with plain language. You can refine the details later.",
  1: "Describe how it works and what makes it different from what already exists.",
  2: "Help us understand the shape of your idea and what it includes.",
  3: "Materials and sharing history help prepare your packet.",
  4: "Tell us what kind of support you are looking for.",
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
      return;
    }
    if (step === 5) {
      const validationErrors = validateForGeneration(answers);
      if (validationErrors.length > 0) {
        setFieldError(validationErrors[0].message);
        return;
      }
    } else {
      const validation = validateIntakeStep(step, answers);
      if (validation) {
        setFieldError(validation.message);
        return;
      }
    }
    setFieldError(null);
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
        headers: { "Content-Type": "application/json" },
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
      });
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
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 px-5 py-4 text-sm text-teal-900 shadow-sm">
          <strong>Demo mode:</strong> Sample invention loaded — click through or
          edit, then generate your packet.
        </div>
      ) : null}

      <ProgressIndicator steps={STEP_LABELS} current={step} />

      <Card variant="elevated" className="overflow-hidden">
        {step !== 5 ? (
          stepHint ? (
            <p className="mb-6 rounded-xl bg-mist-50 px-4 py-3 text-sm leading-relaxed text-navy-600">
              {stepHint}
            </p>
          ) : null
        ) : (
          <div className="mb-8 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/70 to-white px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Checkpoint
            </p>
            <h2 className="mt-1 text-xl font-semibold text-navy-900">
              {INTAKE_COPY.reviewTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {INTAKE_COPY.reviewSubcopy}
            </p>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-8">
            <TextField
              label="What did you create?"
              hint="Describe it in plain language — no jargon needed."
              value={answers.whatCreated}
              onChange={(v) => update("whatCreated", v)}
              placeholder="e.g. A reusable water bottle that filters as you drink."
            />
            <TextField
              label="What problem does it solve?"
              value={answers.problemSolved}
              onChange={(v) => update("problemSolved", v)}
            />
            <TextField
              label="Who is it for?"
              value={answers.whoFor}
              onChange={(v) => update("whoFor", v)}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <TextField
              label="How does it work?"
              value={answers.howItWorks}
              onChange={(v) => update("howItWorks", v)}
            />
            <TextField
              label="What are the main parts or components?"
              value={answers.mainParts}
              onChange={(v) => update("mainParts", v)}
            />
            <TextField
              label="What makes it different from what already exists?"
              value={answers.whatDifferent}
              onChange={(v) => update("whatDifferent", v)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <SelectField
              label="What kind of thing is it?"
              value={answers.itemType}
              options={ITEM_TYPE_OPTIONS}
              onChange={(v) => update("itemType", v)}
            />
            <YesNoField
              label="Do you have a prototype?"
              value={answers.hasPrototype}
              onChange={(v) => update("hasPrototype", v)}
            />
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
            <CheckboxGroup<AssetType>
              label="Which materials do you already have?"
              hint="Select all that apply."
              options={ASSET_OPTIONS}
              selected={answers.assets}
              onToggle={(v) => update("assets", toggle(answers.assets, v))}
            />
            <CheckboxGroup<SharingChannel>
              label="Have you shared it anywhere?"
              hint="This helps us flag possible public disclosure."
              options={SHARING_OPTIONS}
              selected={answers.sharedChannels}
              onToggle={toggleSharing}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <CheckboxGroup<Goal>
              label="What are you looking for?"
              hint="Select all that apply."
              options={GOAL_OPTIONS}
              selected={answers.goals}
              onToggle={(v) => update("goals", toggle(answers.goals, v))}
            />
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
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
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
      </Card>
    </div>
  );
}
