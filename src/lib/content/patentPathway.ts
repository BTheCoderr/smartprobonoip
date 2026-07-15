export interface PatentPathwayStage {
  id: string;
  title: string;
  description: string;
}

export const PATENT_PATHWAY_INTRO =
  "Many people follow a similar preparation path when exploring whether patent protection may be relevant. These are possible next steps people commonly consider — not a recommendation for your situation, and not legal advice.";

export const PATENT_PATHWAY_STAGES: PatentPathwayStage[] = [
  {
    id: "organize",
    title: "Organize your idea",
    description:
      "Write down what you created, the problem it addresses, how it works, and its main parts in plain language.",
  },
  {
    id: "timeline",
    title: "Document your timeline",
    description:
      "Note approximate dates for when the idea started, when it was written down or sketched, and when a prototype was built.",
  },
  {
    id: "sharing",
    title: "Review your public sharing history",
    description:
      "List when, where, and with whom the idea has been shown or shared, and whether any confidentiality understanding existed.",
  },
  {
    id: "materials",
    title: "Gather supporting materials",
    description:
      "Collect drawings, diagrams, photos, notes, code, and anything else that helps explain the idea.",
  },
  {
    id: "search",
    title: "Search for similar references",
    description:
      "Explore possible similar products, patents, and publications using search terms in your own words — preparation only, not a legal conclusion.",
  },
  {
    id: "speak",
    title: "Speak with a professional or resource",
    description:
      "People commonly speak with a patent attorney, patent agent, Patent and Trademark Resource Center (PTRC), law school clinic, or patent search firm at this stage.",
  },
  {
    id: "decide",
    title: "Decide on a direction",
    description:
      "After those conversations, people commonly consider whether to refine the idea, search more, file, wait, or stop — a decision to make with a professional, not from this tool.",
  },
];
