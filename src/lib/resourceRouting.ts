import { SUPPORT_NEED_OPTIONS, type SupportNeed } from "@/lib/feedback";
import type { IpSignal, ProjectRecord } from "@/lib/types";

export type RoutedResourceId =
  | "ptrc"
  | "patent_pro_bono"
  | "law_school_clinic"
  | "trademark_search"
  | "copyright_registration"
  | "sbdc"
  | "innovation_hub"
  | "mentor_product_dev"
  | "business_attorney"
  | "nda_support"
  | "startup_legal_mentor"
  | "contractor_agreement_review";

export interface RoutedResourceCard {
  id: RoutedResourceId;
  title: string;
  lead: string;
  reasons: string[];
}

const RESOURCE_CATALOG: Record<
  RoutedResourceId,
  { title: string; lead: string }
> = {
  ptrc: {
    title: "Patent and Trademark Resource Center",
    lead: "may be worth exploring if you want general IP education and search help",
  },
  patent_pro_bono: {
    title: "Patent Pro Bono Program",
    lead: "consider asking about if you may need pro bono patent assistance",
  },
  law_school_clinic: {
    title: "Law school IP clinic",
    lead: "a partner may help route you to a clinic for educational review",
  },
  trademark_search: {
    title: "Trademark search resource",
    lead: "may be worth exploring before discussing brand protection",
  },
  copyright_registration: {
    title: "Copyright registration resource",
    lead: "consider asking about if your work includes creative expression",
  },
  sbdc: {
    title: "Small Business Development Center",
    lead: "may be worth exploring for business planning and local support",
  },
  innovation_hub: {
    title: "Innovation hub or accelerator",
    lead: "a partner may help route you to community innovation programs",
  },
  mentor_product_dev: {
    title: "Mentor or product development support",
    lead: "may be worth exploring if you are building a prototype or product",
  },
  business_attorney: {
    title: "Business attorney or contract support",
    lead: "consider asking about if you need business or contract guidance",
  },
  nda_support: {
    title: "NDA or confidentiality support",
    lead: "may be worth exploring before sharing details with partners",
  },
  startup_legal_mentor: {
    title: "Startup legal mentor",
    lead: "may be worth exploring for founder, contractor, or agreement questions",
  },
  contractor_agreement_review: {
    title: "Contractor or founder agreement review resource",
    lead: "consider asking about if you worked with collaborators or contractors",
  },
};

const SIGNAL_RESOURCE_MAP: Partial<Record<IpSignal, RoutedResourceId[]>> = {
  patent_invention: ["ptrc", "patent_pro_bono", "law_school_clinic"],
  trademark_brand: ["trademark_search", "ptrc"],
  copyright_creative: ["copyright_registration", "law_school_clinic"],
  software_code: ["ptrc", "law_school_clinic"],
  trade_secret: ["nda_support", "business_attorney"],
  nda_confidentiality: ["nda_support", "business_attorney"],
  business_formation: ["sbdc", "business_attorney"],
  ownership_collaborator: [
    "business_attorney",
    "law_school_clinic",
    "startup_legal_mentor",
    "contractor_agreement_review",
  ],
  licensing_commercialization: ["innovation_hub", "sbdc"],
  prior_art_search: ["ptrc", "mentor_product_dev"],
  expert_review: ["law_school_clinic", "patent_pro_bono"],
};

const SUPPORT_RESOURCE_MAP: Record<SupportNeed, RoutedResourceId[]> = {
  patent_invention_review: ["ptrc", "patent_pro_bono", "law_school_clinic"],
  trademark_brand_review: ["trademark_search", "ptrc"],
  copyright_creative_guidance: ["copyright_registration", "law_school_clinic"],
  business_formation_contracts: ["sbdc", "business_attorney"],
  nda_confidentiality: ["nda_support", "business_attorney"],
  funding_accelerator: ["innovation_hub", "sbdc"],
  prototype_product_dev: ["mentor_product_dev", "innovation_hub"],
  similar_reference_research: ["ptrc", "mentor_product_dev"],
  ownership_agreement_review: [
    "business_attorney",
    "law_school_clinic",
    "startup_legal_mentor",
    "contractor_agreement_review",
  ],
  not_sure: ["ptrc", "sbdc", "law_school_clinic"],
};

function supportNeedLabel(need: SupportNeed): string {
  return (
    SUPPORT_NEED_OPTIONS.find((option) => option.value === need)?.label ?? need
  );
}

export function buildRoutedResources(
  record: ProjectRecord,
  supportNeeded: SupportNeed[] = [],
): RoutedResourceCard[] {
  const scores = new Map<RoutedResourceId, Set<string>>();

  function add(id: RoutedResourceId, reason: string) {
    const reasons = scores.get(id) ?? new Set<string>();
    reasons.add(reason);
    scores.set(id, reasons);
  }

  for (const signal of record.profile.signals) {
    for (const id of SIGNAL_RESOURCE_MAP[signal] ?? []) {
      add(id, `Your packet flagged ${signal.replace(/_/g, " ")} as a starting point`);
    }
  }

  if (record.answers.wantsProBono) {
    add("patent_pro_bono", "You indicated interest in pro bono support");
    add("law_school_clinic", "You indicated interest in pro bono support");
  }

  if (record.answers.goals.includes("funding")) {
    add("innovation_hub", "You mentioned funding as a goal");
  }
  if (record.answers.goals.includes("business_support")) {
    add("sbdc", "You mentioned business support as a goal");
  }
  if (record.answers.goals.includes("expert_review")) {
    add("law_school_clinic", "You mentioned expert review as a goal");
  }

  for (const need of supportNeeded) {
    for (const id of SUPPORT_RESOURCE_MAP[need] ?? []) {
      add(id, `You selected: ${supportNeedLabel(need)}`);
    }
  }

  if (record.answers.location.trim()) {
    add("sbdc", "Local business resources may be available in your area");
    add("innovation_hub", "Local innovation programs may be available in your area");
  }

  if (scores.size === 0) {
    add("ptrc", "A general IP readiness conversation may be a good first step");
    add("sbdc", "Local business support may help you plan next steps");
  }

  return [...scores.entries()]
    .map(([id, reasons]) => ({
      id,
      title: RESOURCE_CATALOG[id].title,
      lead: RESOURCE_CATALOG[id].lead,
      reasons: [...reasons].slice(0, 3),
    }))
    .sort((a, b) => b.reasons.length - a.reasons.length)
    .slice(0, 6);
}
