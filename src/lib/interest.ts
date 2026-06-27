export const INTEREST_TYPES = [
  { value: "pilot_user", label: "Pilot user" },
  { value: "partner", label: "Partner" },
  { value: "clinic", label: "Clinic" },
  { value: "ip_professional", label: "IP professional" },
  { value: "funder", label: "Funder" },
  { value: "volunteer", label: "Volunteer" },
  { value: "other", label: "Other" },
] as const;

export type InterestType = (typeof INTEREST_TYPES)[number]["value"];

export interface InterestLeadInput {
  name?: string;
  email: string;
  organization?: string;
  role?: string;
  interestType: InterestType | string;
  message?: string;
  consent: boolean;
  companyWebsite?: string;
  attribution?: {
    source?: string;
    campaign?: string;
    medium?: string;
    referrer?: string;
    landingPage?: string;
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeInterestText(
  value: string | undefined,
  max = 500,
): string | null {
  if (!value?.trim()) return null;
  return value.trim().slice(0, max);
}

export function isInterestHoneypotTriggered(input: InterestLeadInput): boolean {
  return Boolean(input.companyWebsite?.trim());
}

export function validateInterestInput(input: InterestLeadInput): string | null {
  if (!input.consent) {
    return "Please confirm you understand not to submit confidential invention details.";
  }
  const email = input.email?.trim();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return "Please enter a valid email address.";
  }
  if (email.length > 254) return "Email is too long.";
  const type = input.interestType?.trim();
  if (!type) return "Please select an interest type.";
  const allowed = new Set(INTEREST_TYPES.map((t) => t.value));
  if (!allowed.has(type as InterestType)) return "Invalid interest type.";
  return null;
}
