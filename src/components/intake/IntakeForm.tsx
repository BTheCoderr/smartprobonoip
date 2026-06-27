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

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoFromUrl = searchParams.get("demo") === "1";
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>(() => {
    if (typeof window !== "undefined") {
      const active = activateDemoFromQuery(`?${searchParams.toString()}`) || isDemoMode();
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

  function update<K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) {
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
    <div>
      {demoActive ? (
        <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          <strong>Demo mode:</strong> Sample invention loaded — click through or
          edit, then generate your profile.
        </div>
      ) : null}

      <ProgressIndicator steps={STEP_LABELS} current={step} />

      <Card className="mt-6">
        {step === 0 && (
          <div className="space-y-5">
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
          <div className="space-y-5">
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
          <div className="space-y-5">
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
                update(
                  "ideaIncludes",
                  toggle(answers.ideaIncludes ?? [], v),
                )
              }
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
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
          <div className="space-y-6">
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
          <div className="space-y-5">
            <p className="text-sm text-navy-600">
              Review your answers before we generate your IP Readiness Packet.
              Edit anything that looks wrong.
            </p>
            {REVIEW_FIELDS.map(({ key, label }) => (
              <TextField
                key={key}
                label={label}
                value={String(answers[key] ?? "")}
                onChange={(v) => update(key, v)}
                rows={key === "whatCreated" || key === "howItWorks" ? 3 : 2}
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
            <p className="rounded-lg bg-mist-50 p-4 text-sm text-navy-600">
              We&rsquo;ll ask you again after you see your profile so we can
              measure how much clearer you feel.
            </p>
          </div>
        )}

        {fieldError ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {fieldError}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-navy-600 transition hover:bg-mist-100 disabled:invisible"
          >
            ← Back
          </button>

          {step < last ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-mist-300 disabled:text-navy-500"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-mist-300"
            >
              {submitting ? "Generating…" : demoActive ? "Generate demo profile" : "Generate my profile"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
