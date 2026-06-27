import {
  AGREEMENT_STATUS_LABELS,
  AGREEMENT_TYPE_LABELS,
  CONTRIBUTOR_HELP_LABELS,
  CONTRIBUTOR_INVOLVEMENT_LABELS,
  INSTITUTION_RELATIONSHIP_LABELS,
} from "./labels";
import type { IntakeAnswers, IpSignal, ProjectRecord } from "./types";

export const OWNERSHIP_SIGNAL: IpSignal = "ownership_collaborator";

export const OWNERSHIP_EXPERT_QUESTIONS = [
  "Who contributed to this idea, design, code, prototype, or brand?",
  "What should I gather to show who created what?",
  "Should a professional review any contractor, founder, school, grant, or employment agreements?",
  "What should I clarify before sharing this with partners, manufacturers, or investors?",
  "Are there any ownership or assignment questions I should resolve before next steps?",
] as const;

export const OWNERSHIP_PREP_DISCLAIMER =
  "Preparation only — not an ownership determination. A professional may want to review your notes before next steps.";

export interface OwnershipAgreementPrep {
  contributorsSummary: string;
  helpSummary: string;
  agreementsSummary: string;
  institutionFlag: string;
  optionalNote: string | null;
  expertQuestions: string[];
  disclaimer: string;
}

export interface OwnershipReadinessMetrics {
  packetsWithOwnershipSignal: number;
  contractorFreelancerInvolvement: number;
  noWrittenAgreements: number;
  notSureOwnershipAnswers: number;
}

export function shouldTriggerOwnershipSignal(answers: IntakeAnswers): boolean {
  const involvement = answers.contributorsInvolved;
  if (involvement === "not_sure") return true;
  if (involvement && involvement !== "solo") return true;
  if (
    answers.institutionRelationship === "yes" ||
    answers.institutionRelationship === "not_sure"
  ) {
    return true;
  }
  return false;
}

export function hasOwnershipPrepSection(record: ProjectRecord): boolean {
  return (
    record.profile.signals.includes(OWNERSHIP_SIGNAL) ||
    ownershipInfoCompleted(record.answers)
  );
}

function labelOrFallback(
  value: string | undefined,
  labels: Record<string, string>,
  fallback: string,
): string {
  if (!value) return fallback;
  return labels[value] ?? fallback;
}

export function buildOwnershipAgreementPrep(
  record: ProjectRecord,
): OwnershipAgreementPrep {
  const { answers } = record;
  const involvement = answers.contributorsInvolved;

  let contributorsSummary = "Not yet described.";
  if (involvement === "solo") {
    contributorsSummary =
      "You indicated you worked on this primarily on your own. Ownership and agreement topics may still be worth reviewing if your situation changes.";
  } else if (involvement) {
    contributorsSummary = labelOrFallback(
      involvement,
      CONTRIBUTOR_INVOLVEMENT_LABELS,
      "Contributors noted — details may be worth reviewing with a professional.",
    );
  }

  const helpTypes = answers.contributorHelpTypes ?? [];
  const helpSummary =
    helpTypes.length > 0
      ? helpTypes
          .map((type) => CONTRIBUTOR_HELP_LABELS[type] ?? type)
          .join("; ")
      : involvement && involvement !== "solo"
        ? "Consider noting what each person helped with before your next conversation."
        : "Not yet described.";

  let agreementsSummary = "Not yet described.";
  if (answers.agreementStatus === "not_applicable") {
    agreementsSummary =
      "You indicated written agreements may not apply to your situation.";
  } else if (answers.agreementStatus) {
    const status = labelOrFallback(
      answers.agreementStatus,
      AGREEMENT_STATUS_LABELS,
      answers.agreementStatus,
    );
    const types = (answers.agreementTypes ?? [])
      .map((type) => AGREEMENT_TYPE_LABELS[type] ?? type)
      .join("; ");
    agreementsSummary = types
      ? `${status}. Types you noted: ${types}`
      : status;
  }

  const institutionFlag = labelOrFallback(
    answers.institutionRelationship,
    INSTITUTION_RELATIONSHIP_LABELS,
    "Not yet described.",
  );

  return {
    contributorsSummary,
    helpSummary,
    agreementsSummary,
    institutionFlag,
    optionalNote: answers.ownershipNotes?.trim() || null,
    expertQuestions: [...OWNERSHIP_EXPERT_QUESTIONS],
    disclaimer: OWNERSHIP_PREP_DISCLAIMER,
  };
}

export function ownershipCsvFields(record: ProjectRecord) {
  const answers = record.answers;
  const signal = record.profile.signals.includes(OWNERSHIP_SIGNAL);
  return {
    ownership_signal: signal,
    contributors_involved: answers.contributorsInvolved ?? "",
    contributor_types: (answers.contributorHelpTypes ?? []).join(";"),
    agreement_status: answers.agreementStatus ?? "",
    agreement_types: (answers.agreementTypes ?? []).join(";"),
    employer_school_grant_flag: answers.institutionRelationship ?? "",
  };
}

export function computeOwnershipMetrics(
  records: ProjectRecord[],
): OwnershipReadinessMetrics {
  let packetsWithOwnershipSignal = 0;
  let contractorFreelancerInvolvement = 0;
  let noWrittenAgreements = 0;
  let notSureOwnershipAnswers = 0;

  for (const record of records) {
    const { answers } = record;
    if (record.profile.signals.includes(OWNERSHIP_SIGNAL)) {
      packetsWithOwnershipSignal += 1;
    }
    if (
      answers.contributorsInvolved === "freelancer_contractor" ||
      answers.contributorsInvolved === "cofounder_team"
    ) {
      contractorFreelancerInvolvement += 1;
    }
    if (answers.agreementStatus === "no") {
      noWrittenAgreements += 1;
    }
    if (
      answers.contributorsInvolved === "not_sure" ||
      answers.agreementStatus === "not_sure" ||
      answers.institutionRelationship === "not_sure"
    ) {
      notSureOwnershipAnswers += 1;
    }
  }

  return {
    packetsWithOwnershipSignal,
    contractorFreelancerInvolvement,
    noWrittenAgreements,
    notSureOwnershipAnswers,
  };
}

export function ownershipInfoCompleted(answers: IntakeAnswers): boolean {
  return Boolean(
    answers.contributorsInvolved ||
      answers.agreementStatus ||
      answers.institutionRelationship ||
      (answers.contributorHelpTypes?.length ?? 0) > 0 ||
      (answers.agreementTypes?.length ?? 0) > 0 ||
      answers.ownershipNotes?.trim(),
  );
}
