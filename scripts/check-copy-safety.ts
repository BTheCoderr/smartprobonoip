/**
 * Asserts that all new packet content passes the forbidden-language checker.
 * Run with: npx tsx scripts/check-copy-safety.ts
 */
import { containsForbiddenLanguage } from "../src/lib/safety";
import { EDUCATION_CARDS } from "../src/lib/content/educationCards";
import {
  PATENT_PATHWAY_INTRO,
  PATENT_PATHWAY_STAGES,
} from "../src/lib/content/patentPathway";
import {
  RESOURCE_CATEGORIES_INTRO,
  RESOURCE_CATEGORY_TYPES,
} from "../src/lib/content/resourceCategories";
import { PACKET_COPY, INTAKE_COPY } from "../src/lib/copy";
import { buildSearchFirmQuestions } from "../src/lib/patentSearchPrep";
import { assertPacketContentSafe } from "../src/lib/packet";
import { generateProfile } from "../src/lib/generateProfile";
import type { IntakeAnswers, ProjectRecord } from "../src/lib/types";

const failures: string[] = [];

function check(label: string, text: string) {
  if (containsForbiddenLanguage(text)) {
    failures.push(`${label}: "${text.slice(0, 120)}"`);
  }
}

for (const card of EDUCATION_CARDS) {
  check(`education card ${card.id} (title)`, card.title);
  check(`education card ${card.id} (shortAnswer)`, card.shortAnswer);
  if (card.detail) check(`education card ${card.id} (detail)`, card.detail);
}

check("pathway intro", PATENT_PATHWAY_INTRO);
for (const stage of PATENT_PATHWAY_STAGES) {
  check(`pathway stage ${stage.id}`, `${stage.title} ${stage.description}`);
}

check("resource categories intro", RESOURCE_CATEGORIES_INTRO);
for (const category of RESOURCE_CATEGORY_TYPES) {
  check(
    `resource category ${category.id}`,
    `${category.title} ${category.description}`,
  );
}

check("disclosure guidance", PACKET_COPY.disclosureGuidance);
check("disclosure events title", PACKET_COPY.disclosureEventsTableTitle);
check("search readiness copy", `${PACKET_COPY.searchReadinessTitle} ${PACKET_COPY.searchReadinessSubtitle}`);
check(
  "search firm questions copy",
  `${PACKET_COPY.searchFirmQuestionsTitle} ${PACKET_COPY.searchFirmQuestionsSubtitle}`,
);
check("pathway/resource titles", `${PACKET_COPY.pathwayTitle} ${PACKET_COPY.resourceTypesTitle}`);
check(
  "wizard copy",
  [
    INTAKE_COPY.wizard.searchReadinessTitle,
    INTAKE_COPY.wizard.searchReadinessHint,
    INTAKE_COPY.wizard.disclosureEventsTitle,
    INTAKE_COPY.wizard.disclosureEventsHint,
  ].join(" \n "),
);

// Search firm questions need a record.
const sampleAnswers: IntakeAnswers = {
  whatCreated: "Sample product",
  problemSolved: "Sample problem",
  whoFor: "Sample users",
  howItWorks: "Sample process description",
  mainParts: "Sample parts",
  whatDifferent: "Sample difference",
  itemType: "physical_product",
  hasPrototype: true,
  assets: ["drawings"],
  sharedChannels: ["none"],
  hasBrandIdentity: false,
  goals: ["expert_review"],
  location: "Sample City",
  wantsProBono: false,
  preClarity: 3,
};
const sampleRecord: ProjectRecord = {
  id: "copy-safety-check",
  createdAt: new Date().toISOString(),
  answers: sampleAnswers,
  profile: generateProfile(sampleAnswers),
  preClarity: 3,
  postClarity: null,
};
for (const question of buildSearchFirmQuestions(sampleRecord)) {
  check("search firm question", question);
}

// Existing built-in safety assertions (throws on failure).
assertPacketContentSafe();

if (failures.length > 0) {
  console.error("Forbidden language detected in:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("Copy safety check passed — no forbidden language found.");
