import { countFilledTimelineFields, getTimelineFieldValue } from "@/lib/packet";
import { buildReadinessEvaluation } from "@/lib/readiness";
import type { SupportNeed } from "@/lib/feedback";
import type { IntakeAnswers, ProjectRecord } from "@/lib/types";
import type { RoutingContext } from "./types";

const URI_AFFILIATION_PATTERN =
  /\b(uri|university of rhode island|urirf|uri innovations)\b/i;

const RHODE_ISLAND_PATTERN = /\b(rhode island|\bri\b|providence|kingston)\b/i;

const OFFICE_ACTION_PATTERN = /\boffice action\b/i;

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function parseApproximateMonth(value: string): Date | null {
  const trimmed = value.trim();
  const iso = trimmed.match(/^(\d{4})-(\d{2})/);
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, 1);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const yearOnly = trimmed.match(/^(\d{4})$/);
  if (yearOnly) {
    const date = new Date(Number(yearOnly[1]), 0, 1);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function isFutureMonth(date: Date, now = new Date()): boolean {
  const current = new Date(now.getFullYear(), now.getMonth(), 1);
  const target = new Date(date.getFullYear(), date.getMonth(), 1);
  return target.getTime() > current.getTime();
}

export function detectUriAffiliationSignal(answers: IntakeAnswers): boolean {
  const blob = [answers.location, answers.ownershipNotes]
    .filter(Boolean)
    .join(" ");

  if (URI_AFFILIATION_PATTERN.test(blob)) return true;

  if (
    (answers.institutionRelationship === "yes" ||
      answers.institutionRelationship === "not_sure") &&
    answers.agreementTypes?.includes("school_university") &&
    RHODE_ISLAND_PATTERN.test(answers.location ?? "")
  ) {
    return true;
  }

  return false;
}

export function detectRhodeIslandLocation(answers: IntakeAnswers): boolean {
  return RHODE_ISLAND_PATTERN.test(answers.location ?? "");
}

export function detectPastDisclosureWithoutReliableDate(
  record: ProjectRecord,
): boolean {
  const { profile, answers } = record;
  const hasPublicSignal =
    profile.publicDisclosure ||
    (answers.disclosureEvents ?? []).some((event) => event.kind === "public");

  if (!hasPublicSignal) return false;

  const timelineDate = getTimelineFieldValue(
    record.developmentTimeline,
    "Date first shared publicly",
  );
  if (hasText(timelineDate)) return false;

  const eventDates = (answers.disclosureEvents ?? [])
    .filter((event) => event.kind === "public" || event.kind === "not_sure")
    .map((event) => event.approximateDate?.trim())
    .filter(Boolean);

  return eventDates.length === 0;
}

export function detectConcreteUrgentDeadline(record: ProjectRecord): boolean {
  const now = new Date();
  for (const event of record.answers.disclosureEvents ?? []) {
    const dateText = event.approximateDate?.trim();
    if (!dateText) continue;
    const parsed = parseApproximateMonth(dateText);
    if (parsed && isFutureMonth(parsed, now)) return true;
  }
  return false;
}

export function detectPlannedPublicDisclosure(record: ProjectRecord): boolean {
  const { answers, profile } = record;
  const channels = answers.sharedChannels.filter((channel) => channel !== "none");
  const hasPublicPlan =
    channels.includes("pitch") ||
    channels.includes("event") ||
    channels.includes("online") ||
    channels.includes("social_media");

  if (!hasPublicPlan) return false;

  const alreadyShared =
    hasText(
      getTimelineFieldValue(
        record.developmentTimeline,
        "Date first shared publicly",
      ),
    ) || profile.publicDisclosure;

  return !alreadyShared;
}

export function detectOfficeActionResponseNeed(record: ProjectRecord): boolean {
  const blob = [
    record.answers.ownershipNotes,
    ...(record.profile.expertQuestions ?? []),
  ]
    .filter(Boolean)
    .join(" ");
  return OFFICE_ACTION_PATTERN.test(blob);
}

export function detectReadyForProfessionalConversation(
  record: ProjectRecord,
  savedReferenceCount: number,
  readiness = buildReadinessEvaluation(record, savedReferenceCount),
): boolean {
  const coreMissing = record.profile.missingInfo.length;
  if (coreMissing > 0) return false;
  if (readiness.overallScore < 55) return false;

  const coreCategory = readiness.categories.find((c) => c.id === "core_idea");
  const handoffCategory = readiness.categories.find(
    (c) => c.id === "expert_handoff",
  );

  if (!coreCategory || coreCategory.score < 15) return false;
  if (!handoffCategory || handoffCategory.score < 8) return false;

  return true;
}

export function buildRoutingContext(
  record: ProjectRecord,
  savedReferenceCount = 0,
  supportNeeded: SupportNeed[] = [],
): RoutingContext {
  const readiness = buildReadinessEvaluation(record, savedReferenceCount);
  const coreMissingCount = record.profile.missingInfo.length;

  return {
    projectId: record.id,
    record,
    savedReferenceCount,
    readiness,
    supportNeeded,
    coreMissingCount,
    hasMajorCoreGaps: coreMissingCount >= 2,
    hasUriAffiliation: detectUriAffiliationSignal(record.answers),
    isRhodeIsland: detectRhodeIslandLocation(record.answers),
    hasConcreteUrgentDeadline: detectConcreteUrgentDeadline(record),
    hasPlannedPublicDisclosure: detectPlannedPublicDisclosure(record),
    hasOfficeActionResponseNeed: detectOfficeActionResponseNeed(record),
    hasPastDisclosureWithoutReliableDate:
      detectPastDisclosureWithoutReliableDate(record),
    isReadyForProfessionalConversation: detectReadyForProfessionalConversation(
      record,
      savedReferenceCount,
      readiness,
    ),
    timelineFilledCount: countFilledTimelineFields(record.developmentTimeline),
    materialsCount: record.answers.assets.length,
  };
}
