import { DEMO_INVENTION } from "../src/lib/demo";
import {
  deriveSignals,
  assertSignalCatalogSafe,
  SIGNAL_CATALOG,
} from "../src/lib/signals";
import { containsForbiddenLanguage } from "../src/lib/safety";
import type { IntakeAnswers } from "../src/lib/types";

const SPACEFLIP: IntakeAnswers = {
  whatCreated:
    "SpaceFlip Pro — an app for planning room layouts with AR previews",
  problemSolved:
    "People struggle to visualize furniture placement before buying or moving",
  whoFor: "Renters and homeowners planning room changes",
  howItWorks:
    "Users scan a room, drag furniture models in AR, and save layout plans",
  mainParts:
    "Room scan module, AR renderer, furniture catalog, layout saver, sharing export",
  whatDifferent:
    "Combines room scanning with drag-and-drop AR in one mobile flow",
  itemType: "software",
  hasPrototype: true,
  assets: ["wireframes", "screenshots", "code"],
  sharedChannels: ["none"],
  hasBrandIdentity: true,
  goals: ["expert_review", "business_support"],
  location: "Austin, Texas, USA",
  wantsProBono: false,
  preClarity: 3,
};

function assertSet(label: string, actual: string[], expected: string[]) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = expected.filter((s) => !actualSet.has(s));
  const extra = actual.filter((s) => !expectedSet.has(s));
  if (missing.length > 0 || extra.length > 0) {
    console.error(`${label} FAILED`);
    console.error("  expected:", expected.sort().join(", "));
    console.error("  actual:  ", actual.sort().join(", "));
    if (missing.length) console.error("  missing:", missing.join(", "));
    if (extra.length) console.error("  extra:  ", extra.join(", "));
    process.exit(1);
  }
  console.log(`${label} OK (${actual.length} signals)`);
}

assertSignalCatalogSafe();

const catalogText = Object.values(SIGNAL_CATALOG)
  .flatMap((entry) => [
    entry.label,
    entry.whyItMatters,
    entry.whatToPrepare,
    entry.suggestedResourceType,
  ])
  .join(" ");
if (containsForbiddenLanguage(catalogText)) {
  console.error("Signal catalog failed forbidden-language scan");
  process.exit(1);
}
console.log("Signal catalog safety OK");

const hydro = deriveSignals(DEMO_INVENTION);
assertSet("HydroSeal demo", hydro, [
  "patent_invention",
  "trademark_brand",
  "nda_confidentiality",
  "public_disclosure",
  "prior_art_search",
  "expert_review",
]);

const spaceflip = deriveSignals(SPACEFLIP);
assertSet("SpaceFlip Pro-style", spaceflip, [
  "patent_invention",
  "trademark_brand",
  "copyright_creative",
  "software_code",
  "business_formation",
  "prior_art_search",
  "expert_review",
]);
if (spaceflip.includes("public_disclosure")) {
  console.error("SpaceFlip should not include public_disclosure when not shared");
  process.exit(1);
}
console.log("SpaceFlip public_disclosure guard OK");

console.log("All signal verification passed");
