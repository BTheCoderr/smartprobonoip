"use client";

import { useState } from "react";
import { INTAKE_COPY } from "@/lib/copy";
import { ITEM_TYPE_OPTIONS } from "@/lib/labels";
import type { IntakeAnswers, ItemType } from "@/lib/types";
import { SelectField, TextField } from "../fields";

export function StepYourIdea({
  answers,
  onUpdate,
}: {
  answers: IntakeAnswers;
  onUpdate: <K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) => void;
}) {
  const [showOptional, setShowOptional] = useState(
    () =>
      Boolean(
        answers.problemSolved.trim() ||
          answers.mainParts.trim() ||
          answers.whatDifferent.trim(),
      ),
  );

  return (
    <div className="space-y-6 sm:space-y-7">
      <p className="rounded-md border border-teal-200/80 bg-teal-50/40 px-4 py-3 text-sm leading-relaxed text-navy-700">
        {INTAKE_COPY.wizard.ideaCoreNote}
      </p>

      <TextField
        label="What did you create?"
        hint="One or two sentences in plain language."
        value={answers.whatCreated}
        onChange={(v) => onUpdate("whatCreated", v)}
        example={INTAKE_COPY.fieldExamples.whatCreated}
        required
      />
      <TextField
        label="Who is it for?"
        hint="Describe the people, customers, or users — not how the product works."
        value={answers.whoFor}
        onChange={(v) => onUpdate("whoFor", v)}
        example={INTAKE_COPY.fieldExamples.whoFor}
        required
      />
      <TextField
        label="How does it work?"
        hint="Describe the main steps or mechanism in plain language."
        value={answers.howItWorks}
        onChange={(v) => onUpdate("howItWorks", v)}
        example={INTAKE_COPY.fieldExamples.howItWorks}
        required
      />

      <div className="rounded-md border border-mist-200/80 bg-mist-50/40 px-3 py-3 sm:px-4">
        <SelectField
          label="What kind of thing is it?"
          hint={INTAKE_COPY.wizard.ideaItemTypeHint}
          value={answers.itemType}
          options={ITEM_TYPE_OPTIONS}
          onChange={(v) => onUpdate("itemType", v as ItemType)}
        />
      </div>

      <div className="border-t border-dashed border-mist-200 pt-2">
        <button
          type="button"
          onClick={() => setShowOptional((open) => !open)}
          className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-2 text-left text-sm text-navy-600 hover:text-navy-800"
          aria-expanded={showOptional}
        >
          <span>
            <span className="font-medium text-navy-700">
              {showOptional ? "Hide optional details" : "Add optional details"}
            </span>
            <span className="mt-0.5 block text-xs font-normal text-navy-500">
              {INTAKE_COPY.wizard.ideaOptionalNote}
            </span>
          </span>
          <span className="shrink-0 text-navy-400" aria-hidden>
            {showOptional ? "−" : "+"}
          </span>
        </button>
        {showOptional ? (
          <div className="mt-4 space-y-6 sm:space-y-7">
            <TextField
              label="What problem does it solve?"
              hint="Describe the frustration, cost, or gap — not just the product name."
              value={answers.problemSolved}
              onChange={(v) => onUpdate("problemSolved", v)}
              example={INTAKE_COPY.fieldExamples.problemSolved}
            />
            <TextField
              label="Main parts or components"
              value={answers.mainParts}
              onChange={(v) => onUpdate("mainParts", v)}
              example={INTAKE_COPY.fieldExamples.mainParts}
              rows={2}
            />
            <TextField
              label="What makes it different?"
              hint="User-described differences only — not a legal conclusion."
              value={answers.whatDifferent}
              onChange={(v) => onUpdate("whatDifferent", v)}
              example={INTAKE_COPY.fieldExamples.whatDifferent}
              rows={2}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
