import { INTAKE_COPY } from "@/lib/copy";
import { SEARCH_SOURCE_OPTIONS } from "@/lib/labels";
import type {
  IntakeAnswers,
  SearchReadiness,
  SearchSource,
} from "@/lib/types";
import { getEducationCards } from "@/lib/content/educationCards";
import { EducationCardList } from "@/components/ui/EducationCard";
import { SearchPrepHomePreview } from "@/components/ui/FeaturedGooglePatentsCard";
import { CheckboxGroup, TextField } from "../fields";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

const SEARCH_READINESS_TEXT_FIELDS: {
  key: keyof Omit<SearchReadiness, "sourcesAlreadySearched">;
  label: string;
  hint?: string;
  rows?: number;
}[] = [
  {
    key: "keyFeatures",
    label: "Key features (optional)",
    hint: "The 2–4 features you would point to first when describing your idea.",
  },
  {
    key: "whatFeelsNew",
    label: "What feels new about it (optional)",
    hint: "In your own words — what you have not seen elsewhere.",
  },
  {
    key: "closestProducts",
    label: "Closest existing products (optional)",
    hint: "Products, apps, or tools people might compare your idea to.",
  },
  {
    key: "customerSearchTerms",
    label: "Words a customer might search (optional)",
    hint: "Everyday phrases someone would type when looking for this.",
    rows: 2,
  },
  {
    key: "technicalSearchTerms",
    label: "Technical or industry terms (optional)",
    hint: "More precise terms an engineer or professional might use.",
    rows: 2,
  },
  {
    key: "possibleIndustries",
    label: "Industries where this could be used (optional)",
    hint: "For example: home goods, healthcare, education, outdoor gear.",
    rows: 2,
  },
  {
    key: "materialsMechanismsSteps",
    label: "Materials, mechanisms, steps, or workflows (optional)",
    hint: "Anything mechanical, structural, or step-by-step that makes it work.",
  },
];

export function StepSearchPrep({
  answers,
  onUpdate,
}: {
  answers: IntakeAnswers;
  onUpdate: <K extends keyof IntakeAnswers>(
    key: K,
    value: IntakeAnswers[K],
  ) => void;
}) {
  const searchReadiness = answers.searchReadiness ?? {};

  function updateSearchReadiness<K extends keyof SearchReadiness>(
    key: K,
    value: SearchReadiness[K],
  ) {
    onUpdate("searchReadiness", { ...searchReadiness, [key]: value });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-navy-700">
        {INTAKE_COPY.wizard.searchPrepLead}
      </p>

      <EducationCardList
        title="Quick explainers"
        cards={getEducationCards(["prior_art", "pre_file_search"])}
      />

      <div className="rounded-md border border-dashed border-mist-200 bg-cream/50 p-4 sm:p-5">
        <p className="section-kicker text-teal-700">
          {INTAKE_COPY.wizard.searchReadinessTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">
          {INTAKE_COPY.wizard.searchReadinessHint}
        </p>
        <div className="mt-5 space-y-6">
          {SEARCH_READINESS_TEXT_FIELDS.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              hint={field.hint}
              value={searchReadiness[field.key] ?? ""}
              onChange={(v) => updateSearchReadiness(field.key, v)}
              rows={field.rows ?? 3}
            />
          ))}
          <CheckboxGroup<SearchSource>
            label="Where have you already searched? (optional)"
            hint="Select any places you have looked for similar products or references."
            options={SEARCH_SOURCE_OPTIONS}
            selected={searchReadiness.sourcesAlreadySearched ?? []}
            onToggle={(v) =>
              updateSearchReadiness(
                "sourcesAlreadySearched",
                toggle(searchReadiness.sourcesAlreadySearched ?? [], v),
              )
            }
          />
          <TextField
            label="Similar references you already found (optional)"
            hint="Names, links, or short notes on anything similar you have seen."
            value={searchReadiness.similarReferencesFound ?? ""}
            onChange={(v) =>
              updateSearchReadiness("similarReferencesFound", v)
            }
          />
        </div>
      </div>

      <SearchPrepHomePreview />
      <div className="rounded-md border border-mist-200 bg-cream/50 px-4 py-4 text-sm leading-relaxed text-navy-600">
        <p className="font-medium text-navy-800">After your packet is ready</p>
        <p className="mt-1">
          You will get grouped starter queries, gap maps, CPC conversation starters,
          and saved reference tools — preparation only, not patentability opinions.
        </p>
      </div>
    </div>
  );
}
