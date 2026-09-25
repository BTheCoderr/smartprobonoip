export const CANONICAL_INTAKE_FIELDS = [
  {
    key: "project.title",
    label: "Invention title",
    description: "Working title of the invention or project.",
  },
  {
    key: "technical.problem_or_need",
    label: "Problem or need",
    description: "Problem, limitation, or need the invention addresses.",
  },
  {
    key: "technical.detailed_description",
    label: "Detailed invention description",
    description: "Technical description of what the invention is.",
  },
  {
    key: "technical.key_components_or_steps",
    label: "Key components or steps",
    description: "Main parts, modules, ingredients, or process steps.",
  },
  {
    key: "technical.how_it_works",
    label: "How it works",
    description: "How the components or steps interact or operate.",
  },
  {
    key: "technical.how_to_make",
    label: "How to make or build it",
    description: "How the invention can be made, built, configured, or reproduced.",
  },
  {
    key: "technical.how_to_use",
    label: "How to use it",
    description: "How the invention is used or operated.",
  },
  {
    key: "technical.advantages_improvements",
    label: "Advantages or improvements",
    description: "Inventor-described differences, improvements, or advantages.",
  },
  {
    key: "technical.alternatives_variations",
    label: "Alternatives or variations",
    description: "Other versions, configurations, materials, or approaches.",
  },
  {
    key: "technical.best_known_implementation",
    label: "Best-known implementation",
    description: "Best or preferred implementation currently known to the inventor.",
  },
  {
    key: "contributors.collection",
    label: "Contributors and contribution details",
    description: "People who contributed and the facts describing each contribution.",
  },
  {
    key: "disclosure_events.collection",
    label: "Disclosure, sale, offer, and outside-use events",
    description: "External sharing, publication, presentation, demo, offer, sale, or use facts.",
  },
  {
    key: "funding_sources.collection",
    label: "Funding and institutional resources",
    description: "Sponsors, grants, employers, schools, and institutional resource facts.",
  },
  {
    key: "ownership_relationships.collection",
    label: "Employment, ownership, and agreement relationships",
    description: "Reported employment, contractor, assignment, license, or other IP-related relationships.",
  },
  {
    key: "prior_applications.collection",
    label: "Prior applications or related filings",
    description: "User-reported prior patent applications, provisionals, PCTs, or related filings.",
  },
  {
    key: "saved_references.collection",
    label: "Known references",
    description: "User-supplied patents, publications, products, websites, or other related references.",
  },
  {
    key: "evidence_files.collection",
    label: "Supporting evidence files",
    description: "Private supporting files already attached to the invention record.",
  },
] as const;

export type CanonicalIntakeFieldKey =
  (typeof CANONICAL_INTAKE_FIELDS)[number]["key"];

export const CANONICAL_INTAKE_FIELD_KEYS = CANONICAL_INTAKE_FIELDS.map(
  (field) => field.key,
) as CanonicalIntakeFieldKey[];

export function isCanonicalIntakeFieldKey(
  value: unknown,
): value is CanonicalIntakeFieldKey {
  return (
    typeof value === "string" &&
    CANONICAL_INTAKE_FIELD_KEYS.includes(value as CanonicalIntakeFieldKey)
  );
}

export function canonicalFieldLabel(key: string): string {
  return (
    CANONICAL_INTAKE_FIELDS.find((field) => field.key === key)?.label ?? key
  );
}
