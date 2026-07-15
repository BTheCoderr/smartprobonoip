import { INTAKE_COPY } from "@/lib/copy";
import {
  ASSET_OPTIONS,
  GOAL_OPTIONS,
  IDEA_INCLUDE_OPTIONS,
} from "@/lib/labels";
import type {
  AssetType,
  Goal,
  IdeaInclude,
  IntakeAnswers,
} from "@/lib/types";
import { CheckboxGroup, TextField, YesNoField } from "../fields";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function StepMaterialsPrototype({
  answers,
  onUpdate,
}: {
  answers: IntakeAnswers;
  onUpdate: <K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) => void;
}) {
  return (
    <div className="space-y-6 sm:space-y-7">
      <YesNoField
        label="Do you have a working prototype?"
        hint="Sketches and photos count — select materials below."
        value={answers.hasPrototype}
        onChange={(v) => onUpdate("hasPrototype", v)}
      />
      <YesNoField
        label="Do you have a name, logo, or brand identity?"
        value={answers.hasBrandIdentity}
        onChange={(v) => onUpdate("hasBrandIdentity", v)}
      />
      <TextField
        label="Product or brand name (optional)"
        hint="If your idea has a name, enter it so your packet uses it correctly."
        value={answers.brandName ?? ""}
        onChange={(v) => onUpdate("brandName", v)}
        rows={1}
      />
      <CheckboxGroup<AssetType>
        label="Materials you already have"
        hint="Select all that apply — missing items become checklist items in your packet."
        options={ASSET_OPTIONS}
        selected={answers.assets}
        onToggle={(v) => onUpdate("assets", toggle(answers.assets, v))}
      />
      <CheckboxGroup<IdeaInclude>
        label="What your idea includes"
        hint="Optional — helps suggest relevant packet sections."
        options={IDEA_INCLUDE_OPTIONS}
        selected={answers.ideaIncludes ?? []}
        onToggle={(v) =>
          onUpdate("ideaIncludes", toggle(answers.ideaIncludes ?? [], v))
        }
      />
      <CheckboxGroup<Goal>
        label="What kind of support are you looking for?"
        options={GOAL_OPTIONS}
        selected={answers.goals}
        onToggle={(v) => onUpdate("goals", toggle(answers.goals, v))}
      />
      <TextField
        label="Your location"
        hint="City / state / country — for local resource suggestions."
        value={answers.location}
        onChange={(v) => onUpdate("location", v)}
        example={INTAKE_COPY.fieldExamples.location}
        rows={1}
      />
      <YesNoField
        label="Interested in low-cost or pro bono support?"
        value={answers.wantsProBono}
        onChange={(v) => onUpdate("wantsProBono", v)}
      />
    </div>
  );
}
