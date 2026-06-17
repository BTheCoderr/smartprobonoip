"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import {
  ASSET_OPTIONS,
  GOAL_OPTIONS,
  ITEM_TYPE_OPTIONS,
  SHARING_OPTIONS,
} from "@/lib/labels";
import { getStore } from "@/lib/store";
import type {
  AssetType,
  Goal,
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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const last = STEP_LABELS.length - 1;

  function update<K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSharing(value: SharingChannel) {
    setAnswers((prev) => {
      if (value === "none") return { ...prev, sharedChannels: ["none"] };
      const without = prev.sharedChannels.filter((c) => c !== "none");
      return { ...prev, sharedChannels: toggle(without, value) };
    });
  }

  const canProceed = step !== 0 || answers.whatCreated.trim().length > 0;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = (await res.json()) as { profile: ReadinessProfile };
      const record = await getStore().saveRecord({
        answers,
        profile: data.profile,
        preClarity: answers.preClarity,
      });
      router.push(`/smartprobonoip/profile/${record.id}`);
    } catch {
      setError(
        "Something went wrong generating your profile. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div>
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
              onClick={() => setStep((s) => Math.min(last, s + 1))}
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
              {submitting ? "Generating…" : "Generate my profile"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
