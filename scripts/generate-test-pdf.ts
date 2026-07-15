/**
 * Generates a test IP Readiness Packet PDF for the fictional "ShelfSnap"
 * invention, exercising every new intake field (brand name, search
 * readiness, disclosure events, extended timeline).
 *
 * Run with: npx tsx scripts/generate-test-pdf.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateProfile } from "../src/lib/generateProfile";
import { buildPacketPdf } from "../src/lib/pdf";
import type { IntakeAnswers, ProjectRecord } from "../src/lib/types";

const SHELFSNAP_ANSWERS: IntakeAnswers = {
  whatCreated:
    "ShelfSnap — a magnetic modular shelving system with snap-lock brackets that lets renters mount and rearrange shelves without drilling into walls.",
  problemSolved:
    "Renters cannot drill into walls without losing their deposit, so they give up storage space or rely on flimsy adhesive shelves that sag and fall.",
  whoFor:
    "Renters, college students in dorms, and anyone who wants rearrangeable storage without damaging walls.",
  howItWorks:
    "A slim steel rail attaches to the wall with removable high-bond strips. Shelf brackets contain neodymium magnet arrays and a mechanical snap-lock cam that clamps onto the rail when rotated a quarter turn. Shelves click into the brackets and can be repositioned along the rail in seconds without tools.",
  mainParts:
    "Steel mounting rail, removable adhesive backing strips, magnetic snap-lock brackets with cam lever, bamboo shelf boards, rubber wall bumpers, and alignment spacer clips.",
  whatDifferent:
    "Unlike adhesive floating shelves, the load is carried by a rail and mechanical cam lock rather than the adhesive alone, and shelves can slide and re-lock anywhere along the rail instead of being fixed in place.",
  itemType: "physical_product",
  hasPrototype: true,
  assets: ["drawings", "photos", "diagrams", "notes"],
  sharedChannels: ["pitch", "friends"],
  hasBrandIdentity: true,
  ideaIncludes: ["brand_name", "how_it_works", "look_and_design"],
  goals: ["protection", "expert_review"],
  location: "Providence, Rhode Island, USA",
  wantsProBono: true,
  preClarity: 2,
  contributorsInvolved: "solo",
  contributorHelpTypes: [],
  agreementStatus: "not_applicable",
  agreementTypes: [],
  institutionRelationship: "no",
  ownershipNotes: "",
  brandName: "ShelfSnap",
  searchReadiness: {
    keyFeatures:
      "Magnetic snap-lock brackets, quarter-turn cam lever, repositionable shelves on a rail, no-drill removable rail mounting.",
    whatFeelsNew:
      "Combining a magnetic alignment array with a mechanical cam lock so the shelf carries real weight but still moves without tools.",
    closestProducts:
      "Command floating shelves, IKEA BOAXEL rail system, French cleat shelving",
    customerSearchTerms:
      "no drill shelves for renters, damage free wall shelving, movable wall shelf system",
    technicalSearchTerms:
      "magnetic shelf bracket cam lock, rail mounted modular shelving, quarter turn locking bracket",
    possibleIndustries:
      "home organization, rental furnishings, dorm storage, retail displays",
    materialsMechanismsSteps:
      "Neodymium magnet array aligns the bracket; rotating the cam lever a quarter turn clamps the bracket to the steel rail; high-bond removable strips hold the rail to the wall.",
    sourcesAlreadySearched: ["google", "marketplaces", "youtube"],
    similarReferencesFound:
      "Found several adhesive floating shelves and slatwall systems on Amazon; none combined magnets with a cam lock on a removable rail.",
  },
  disclosureEvents: [
    {
      id: "shelfsnap-event-1",
      kind: "private",
      approximateDate: "around February 2026",
      whereShown: "A maker-space workshop meeting in Providence",
      whoSawIt: "Two fellow makers and a workshop mentor",
      whatWasShown:
        "The working prototype including the cam-lock bracket mechanism",
      ndaOrConfidentiality: "yes",
      includedKeyFeatures: "yes",
    },
    {
      id: "shelfsnap-event-2",
      kind: "public",
      approximateDate: "May 2026",
      whereShown: "A local startup pitch night open to the public",
      whoSawIt: "Roughly 40 attendees, no sign-in sheet",
      whatWasShown:
        "A 3-minute demo of shelves snapping on and off the rail; the internal cam mechanism was not opened up",
      ndaOrConfidentiality: "no",
      includedKeyFeatures: "not_sure",
    },
  ],
};

const record: ProjectRecord = {
  id: "shelfsnap-test-packet-0001",
  createdAt: new Date().toISOString(),
  answers: SHELFSNAP_ANSWERS,
  profile: generateProfile(SHELFSNAP_ANSWERS),
  preClarity: 2,
  postClarity: 4,
  followUpStatus: { day30: "pending", day60: "pending", day90: "pending" },
  developmentTimeline: {
    "Date idea started": "Fall 2025",
    "Date first written down or sketched": "November 2025",
    "Date first prototype built": "January 2026",
    "Date first shown privately": "around February 2026",
    "Date first shared publicly": "May 2026",
    "Date first pitched, sold, or demoed": "May 2026",
    "Date of major improvements": "June 2026 — switched to quarter-turn cam lever",
  },
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outDir = join(scriptDir, "..", "test-output");
mkdirSync(outDir, { recursive: true });

const doc = buildPacketPdf(record);
const outPath = join(outDir, "shelfsnap-packet.pdf");
writeFileSync(outPath, Buffer.from(doc.output("arraybuffer")));

console.log(`Wrote ${outPath} (${doc.getNumberOfPages()} pages)`);
