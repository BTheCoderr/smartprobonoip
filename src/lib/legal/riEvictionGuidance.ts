import type {
  RiEvictionCategory,
  RiEvictionGuidance,
  RiEvictionIntake,
} from "@/lib/legal/riEvictionTypes";

function numberLike(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function courtDateUrgent(value: string): boolean {
  if (!value) return false;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const diff = (date.getTime() - Date.now()) / 86_400_000;
  return diff >= 0 && diff <= 7;
}

export function deriveRiEvictionCategory(
  intake: RiEvictionIntake,
): RiEvictionCategory {
  if (intake.caseFiled === "yes" || intake.noticeType === "Court summons / complaint") {
    return "court_case";
  }
  if (
    intake.behindOnRent === "yes" ||
    intake.noticeType === "Five-day demand / nonpayment"
  ) {
    return "nonpayment";
  }
  if (intake.noticeType === "Notice of noncompliance / lease issue") {
    return "noncompliance";
  }
  if (intake.noticeType === "Termination of tenancy notice") {
    return "termination";
  }
  return "unclear";
}

function categoryLabel(category: RiEvictionCategory): string {
  switch (category) {
    case "nonpayment":
      return "Nonpayment / rent-arrears issue";
    case "noncompliance":
      return "Noncompliance / lease-issue notice";
    case "termination":
      return "Termination-of-tenancy notice";
    case "court_case":
      return "Court case or summons reported";
    default:
      return "Issue type needs confirmation";
  }
}

export function buildRiEvictionGuidance(
  intake: RiEvictionIntake,
): RiEvictionGuidance {
  const category = deriveRiEvictionCategory(intake);
  const urgent = courtDateUrgent(intake.courtDate) || intake.judgmentEntered === "yes";
  const flags: string[] = [];
  const immediateSteps: string[] = [];
  const gatherDocuments: string[] = [
    "Every notice, demand letter, summons, complaint, or court paper you received",
    "Your lease or rental agreement, if you have one",
    "Rent receipts, payment history, bank records, or other proof of payment",
    "Texts, emails, letters, or portal messages with the landlord or property manager",
  ];
  const questionsToConfirm: string[] = [
    "What type of notice or court paper is this, and what date was it mailed, served, or received?",
    "Has a case actually been filed, and if so, what is the court date and case number?",
    "What deadline or required response, if any, applies to this specific paper?",
  ];
  const sourceIds = new Set<string>([
    "ri-judiciary-landlord-tenant",
    "ri-judiciary-faq",
    "rils-housing",
  ]);

  if (urgent) {
    flags.push("Time-sensitive court or judgment information reported");
    immediateSteps.push(
      "Treat this as time-sensitive. Confirm the court date, judgment date, and any response or appeal deadline promptly with the Rhode Island Judiciary, Rhode Island Legal Services, or a qualified attorney.",
    );
  }

  if (intake.noticeReceived === "yes") {
    immediateSteps.push(
      "Keep the original notice and note when and how you received it. Bring it to any court, legal-aid, or attorney review.",
    );
  }

  if (category === "nonpayment") {
    sourceIds.add("ri-landlord-tenant-handbook");
    immediateSteps.push(
      "The Rhode Island Judiciary's current nonpayment materials use a five-day demand notice after rent is more than fifteen days in arrears. Compare your paper to the official form, but confirm how the rule applies to your facts before acting.",
    );
    questionsToConfirm.push(
      "Does the notice match the current Rhode Island nonpayment process, and what amount of rent does it claim is owed?",
    );
  }

  if (category === "court_case") {
    immediateSteps.push(
      "Do not ignore a summons or scheduled hearing. The Rhode Island Judiciary says parties should bring the documents and other evidence they need to support their position.",
    );
    questionsToConfirm.push(
      "What division of District Court is handling the case, and what documents or witnesses should be brought to the hearing?",
    );
  }

  if (intake.judgmentEntered === "yes") {
    flags.push("Judgment reported");
    immediateSteps.push(
      "The Rhode Island Judiciary's current FAQ states that a tenant has five calendar days after the hearing date to appeal an eviction decision to Superior Court and must continue paying rent as it becomes due during an appeal. Confirm the exact deadline immediately for your case.",
    );
    questionsToConfirm.push(
      "What date was judgment entered, and is an appeal still available in this case?",
    );
  }

  if (intake.unsafeConditions === "yes") {
    flags.push("Housing-condition concerns reported");
    gatherDocuments.push(
      "Photos, videos, inspection reports, repair requests, and messages about unsafe or unhealthy conditions",
    );
    questionsToConfirm.push(
      "Were repair requests made, and are there inspection or code-enforcement records?",
    );
  }

  if (intake.appliedForAssistance === "yes") {
    flags.push("Rental-assistance application reported");
    gatherDocuments.push(
      "Rental-assistance application confirmations, case numbers, approval/denial notices, and program messages",
    );
  }

  if (intake.subsidy === "yes") {
    flags.push("Public or subsidized housing may be involved");
    gatherDocuments.push(
      "Voucher, housing-authority, public-housing, or subsidy paperwork and worker contact information",
    );
    questionsToConfirm.push(
      "Do additional program or federal rules apply because the housing is subsidized?",
    );
  }

  if (intake.retaliationConcern === "yes") {
    flags.push("Retaliation concern reported");
    questionsToConfirm.push(
      "What happened before the eviction notice, including repair complaints, inspections, or other tenant activity?",
    );
  }

  if (intake.discriminationConcern === "yes") {
    flags.push("Discrimination concern reported");
    questionsToConfirm.push(
      "What facts make you concerned that discrimination may be involved, and what records support that concern?",
    );
  }

  if (intake.disabilityAccommodation === "yes") {
    flags.push("Disability / accommodation issue reported");
    gatherDocuments.push(
      "Accommodation requests, medical/supporting documentation you choose to share, and landlord responses",
    );
  }

  if (intake.needsInterpreter === "yes") {
    flags.push("Language-access need reported");
    immediateSteps.push(
      "Ask the court, legal-aid provider, or attorney about interpreter or language-access support as early as possible.",
    );
  }

  const arrears = numberLike(intake.arrearsAmount);
  if (arrears != null && arrears > 0) {
    questionsToConfirm.push(
      "What amount does the landlord claim is owed, and do your payment records agree with that amount?",
    );
  }

  const summary = [
    "You reported a Rhode Island residential eviction or landlord-tenant issue.",
    `Preparation category: ${categoryLabel(category)}.`,
    intake.noticeReceived === "yes"
      ? `You reported receiving: ${intake.noticeType}.`
      : "A notice has not been confirmed from the intake.",
    intake.caseFiled === "yes"
      ? "You reported that a court case has been filed."
      : null,
    intake.courtDate ? `Court date entered: ${intake.courtDate}.` : null,
    "This categorization is for preparation only and is not a legal conclusion.",
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  return {
    category,
    categoryLabel: categoryLabel(category),
    summary,
    flags,
    immediateSteps: immediateSteps.length
      ? immediateSteps
      : [
          "Gather the papers you have and confirm what type of notice or case, if any, is involved before relying on a deadline or next step.",
        ],
    gatherDocuments: [...new Set(gatherDocuments)],
    questionsToConfirm: [...new Set(questionsToConfirm)],
    sourceIds: [...sourceIds],
    urgent,
  };
}

export function formatRiEvictionSummary(
  intake: RiEvictionIntake,
  guidance: RiEvictionGuidance,
): string {
  const list = (title: string, items: string[]) => [
    title,
    ...(items.length ? items.map((item) => `- ${item}`) : ["- None reported"]),
    "",
  ];

  return [
    "SMARTPROBONO — RHODE ISLAND EVICTION PREPARATION SUMMARY",
    "Preparation support only — not legal advice",
    "",
    "SITUATION",
    guidance.summary,
    "",
    `City: ${intake.city || "[not provided]"}`,
    `ZIP: ${intake.zip || "[not provided]"}`,
    `Notice received: ${intake.noticeReceived}`,
    `Notice type: ${intake.noticeType}`,
    `Notice date: ${intake.noticeDate || "[not provided]"}`,
    `Case filed: ${intake.caseFiled}`,
    `Court date: ${intake.courtDate || "[not provided]"}`,
    `Judgment entered: ${intake.judgmentEntered}`,
    `Behind on rent: ${intake.behindOnRent}`,
    `Amount reported behind: ${intake.arrearsAmount || "[not provided]"}`,
    "",
    ...list("ISSUE FLAGS", guidance.flags),
    ...list("IMMEDIATE PREPARATION STEPS", guidance.immediateSteps),
    ...list("DOCUMENTS TO GATHER", guidance.gatherDocuments),
    ...list("QUESTIONS TO CONFIRM", guidance.questionsToConfirm),
    "USER NOTES",
    intake.situationNotes || "[none provided]",
    "",
    "SmartProBono is not a law firm. Confirm rights, deadlines, filing requirements, and case-specific decisions with the Rhode Island Judiciary, Rhode Island Legal Services, or another qualified legal professional.",
  ].join("\n");
}
