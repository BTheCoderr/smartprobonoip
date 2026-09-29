export type RiYesNoUnsure = "yes" | "no" | "unsure";

export type RiEvictionNoticeType =
  | "Five-day demand / nonpayment"
  | "Notice of noncompliance / lease issue"
  | "Termination of tenancy notice"
  | "Court summons / complaint"
  | "Other / unsure";

export type RiEvictionGoal =
  | "Stay in the home"
  | "Understand the court process"
  | "Address rent arrears"
  | "Get more time"
  | "Address housing conditions"
  | "Prepare for legal-aid review"
  | "Other";

export type RiEvictionIntake = {
  city: string;
  zip: string;
  noticeReceived: RiYesNoUnsure;
  noticeType: RiEvictionNoticeType;
  noticeDate: string;
  caseFiled: RiYesNoUnsure;
  courtDate: string;
  judgmentEntered: RiYesNoUnsure;
  behindOnRent: RiYesNoUnsure;
  arrearsAmount: string;
  appliedForAssistance: RiYesNoUnsure;
  subsidy: RiYesNoUnsure;
  unsafeConditions: RiYesNoUnsure;
  conditionsNotes: string;
  retaliationConcern: RiYesNoUnsure;
  discriminationConcern: RiYesNoUnsure;
  disabilityAccommodation: RiYesNoUnsure;
  needsInterpreter: RiYesNoUnsure;
  goals: RiEvictionGoal[];
  otherGoal: string;
  situationNotes: string;
  understandsPreparationOnly: boolean;
};

export type RiEvictionCategory =
  | "nonpayment"
  | "noncompliance"
  | "termination"
  | "court_case"
  | "unclear";

export type RiEvictionSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  description: string;
};

export type RiEvictionGuidance = {
  category: RiEvictionCategory;
  categoryLabel: string;
  summary: string;
  flags: string[];
  immediateSteps: string[];
  gatherDocuments: string[];
  questionsToConfirm: string[];
  sourceIds: string[];
  urgent: boolean;
};
