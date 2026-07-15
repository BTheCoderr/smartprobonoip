export interface ResourceCategoryInfo {
  id: string;
  title: string;
  description: string;
}

export const RESOURCE_CATEGORIES_INTRO =
  "Different types of resources exist for different goals. These neutral descriptions are for orientation only — they are not referrals, endorsements, or recommendations.";

export const RESOURCE_CATEGORY_TYPES: ResourceCategoryInfo[] = [
  {
    id: "patent_attorney_agent",
    title: "Patent attorney or patent agent",
    description:
      "Licensed professionals who can review invention details and discuss patent-related options with you.",
  },
  {
    id: "patent_search_firm",
    title: "Patent search firm",
    description:
      "Companies that perform professional searches for patents and other references similar to an idea.",
  },
  {
    id: "ptrc",
    title: "Patent and Trademark Resource Center (PTRC)",
    description:
      "Libraries with staff trained to help the public learn how to use patent and trademark search tools.",
  },
  {
    id: "law_school_clinic",
    title: "Law school IP clinic",
    description:
      "University programs where supervised law students may assist qualifying inventors with IP matters.",
  },
  {
    id: "uspto_resources",
    title: "USPTO resources",
    description:
      "The United States Patent and Trademark Office publishes free educational materials, search tools, and program information.",
  },
  {
    id: "startup_accelerator",
    title: "Startup accelerator",
    description:
      "Programs that support early-stage companies with mentorship, structure, and sometimes funding readiness.",
  },
  {
    id: "business_mentor",
    title: "Business mentor",
    description:
      "Experienced businesspeople who volunteer or work with founders on planning, strategy, and next steps.",
  },
  {
    id: "trademark_attorney",
    title: "Trademark attorney",
    description:
      "Licensed professionals who focus on brand names, logos, and trademark-related questions.",
  },
  {
    id: "copyright_resources",
    title: "Copyright resources",
    description:
      "Educational materials and registration information for creative works such as writing, art, music, and code.",
  },
  {
    id: "grant_pitch_resources",
    title: "Grant or pitch competition resources",
    description:
      "Programs and competitions that may provide funding or exposure for early-stage ideas and ventures.",
  },
];
