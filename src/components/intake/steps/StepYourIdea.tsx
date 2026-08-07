"use client";

import { useState } from "react";
import { INTAKE_COPY } from "@/lib/copy";
import { ITEM_TYPE_OPTIONS } from "@/lib/labels";
import type { IntakeAnswers, ItemType } from "@/lib/types";
import { getPatentEducationTopic } from "@/lib/paths/patent/education";
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
          answers.whatDifferent.trim() ||
          answers.preferredEmbodiment?.trim() ||
          answers.alternativeVersions?.trim() ||
          answers.knownSimilarWork?.trim() ||
          answers.inventionTitle?.trim(),
      ),
  );

  const idfTopic = getPatentEducationTopic("idf_basics");

  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="rounded-md border border-teal-200/80 bg-teal-50/40 px-4 py-3 text-sm leading-relaxed text-navy-700">
        <p className="font-medium text-navy-900">
          {INTAKE_COPY.wizard.idfFramingTitle}
        </p>
        <p className="mt-1">{INTAKE_COPY.wizard.ideaCoreNote}</p>
      </div>

      {idfTopic ? (
        <details className="rounded-md border border-dashed border-mist-200 bg-cream/50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-navy-800">
            Why this looks like an invention disclosure form
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-navy-600">
            {idfTopic.summary}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-navy-700">
            {idfTopic.points.slice(0, 5).map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-navy-400">•</span>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-navy-500">
            {idfTopic.safetyNote}
          </p>
        </details>
      ) : null}

      <TextField
        label="Invention title (optional)"
        hint="A short working title for your packet — you can change it later."
        value={answers.inventionTitle ?? ""}
        onChange={(v) => onUpdate("inventionTitle", v)}
        example="HydroSeal portable inline filter bottle"
        rows={1}
      />
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
              {showOptional
                ? "Hide optional disclosure details"
                : "Add optional disclosure details"}
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
              label="Preferred or best-described version"
              hint="If you have a favorite design or working prototype, describe that version."
              value={answers.preferredEmbodiment ?? ""}
              onChange={(v) => onUpdate("preferredEmbodiment", v)}
              example="The hiking bottle with the twist-lock compostable cartridge and silicone mouthpiece."
              rows={2}
            />
            <TextField
              label="Alternatives and variations"
              hint="Other ways it could work, materials you considered, or earlier designs."
              value={answers.alternativeVersions ?? ""}
              onChange={(v) => onUpdate("alternativeVersions", v)}
              example="Could also use a press-style cartridge; earlier sketch used a screw cap instead of twist-lock."
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
            <TextField
              label="Similar work you already know"
              hint="Products, patents, articles, or videos that seem related — in your own words."
              value={answers.knownSimilarWork ?? ""}
              onChange={(v) => onUpdate("knownSimilarWork", v)}
              example="LifeStraw bottles and Grayl press bottles — none with a twist-lock compostable cartridge."
              rows={2}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
