import type { IntakeAnswers, ProjectRecord, ReadinessProfile } from "@/lib/types";

/** Empty narrative fields — metrics-only answers for partner dashboard API. */
function redactAnswersForPartnerMetrics(
  answers: IntakeAnswers,
): IntakeAnswers {
  return {
    whatCreated: "",
    problemSolved: "",
    whoFor: "",
    howItWorks: "",
    mainParts: "",
    whatDifferent: "",
    itemType: answers.itemType,
    hasPrototype: answers.hasPrototype,
    assets: answers.assets,
    sharedChannels: answers.sharedChannels,
    hasBrandIdentity: answers.hasBrandIdentity,
    ideaIncludes: answers.ideaIncludes,
    goals: answers.goals,
    location: "",
    wantsProBono: answers.wantsProBono,
    preClarity: answers.preClarity,
    contributorsInvolved: answers.contributorsInvolved,
    contributorHelpTypes: answers.contributorHelpTypes,
    agreementStatus: answers.agreementStatus,
    agreementTypes: answers.agreementTypes,
    institutionRelationship: answers.institutionRelationship,
    ownershipNotes: "",
    brandName: "",
    searchReadiness: undefined,
    disclosureEvents: [],
    inventionTitle: "",
    preferredEmbodiment: "",
    alternativeVersions: "",
    knownSimilarWork: "",
    aiAssistance: answers.aiAssistance,
    aiAssistanceNotes: "",
    protectionPath: answers.protectionPath,
  };
}

function redactProfileForPartnerMetrics(
  profile: ReadinessProfile,
): ReadinessProfile {
  return {
    ideaSummary: "",
    signals: profile.signals,
    completeInfo: [],
    missingInfo: [],
    publicDisclosure: profile.publicDisclosure,
    publicDisclosureNote: "",
    suggestedNextStep: "",
    expertQuestions: [],
    recommendedResources: profile.recommendedResources,
    disclaimer: "",
    generator: profile.generator,
  };
}

/**
 * Strip invention narratives from records returned to partner dashboard APIs.
 * Keeps fields needed for aggregated metrics, filters, and ownership flags.
 */
export function redactRecordForPartnerMetrics(
  record: ProjectRecord,
): ProjectRecord {
  return {
    id: record.id,
    createdAt: record.createdAt,
    answers: redactAnswersForPartnerMetrics(record.answers),
    profile: redactProfileForPartnerMetrics(record.profile),
    preClarity: record.preClarity,
    postClarity: record.postClarity,
    isDemo: record.isDemo,
    followUpStatus: record.followUpStatus,
    partnerSlug: record.partnerSlug,
    partnerName: record.partnerName,
    source: record.source,
    campaign: record.campaign,
    developmentTimeline: undefined,
  };
}

export function redactRecordsForPartnerMetrics(
  records: ProjectRecord[],
): ProjectRecord[] {
  return records.map(redactRecordForPartnerMetrics);
}
