import type { EducationCardContent } from "../types";

/**
 * Short educational explainers. Neutral, plain-language definitions only —
 * no recommendations, no legal conclusions, no cost figures, no timing rules.
 */
export const EDUCATION_CARDS: EducationCardContent[] = [
  {
    id: "prior_art",
    title: "What is prior art?",
    shortAnswer:
      "Prior art is anything publicly available before a patent filing — earlier patents, products, articles, videos, or presentations — that relates to an idea.",
    detail:
      "Professionals compare an idea against prior art to understand how it fits into what already exists. Finding something similar does not decide anything by itself; a professional reviews what it means.",
  },
  {
    id: "pre_file_search",
    title: "What is a pre-filing search?",
    shortAnswer:
      "A pre-filing search looks for existing patents and publications similar to an idea before any filing decision is made.",
    detail:
      "People commonly do informal searching themselves and may also ask a search firm or patent professional for a more thorough search. The results become discussion material for a professional review.",
  },
  {
    id: "clearance_review",
    title: "What is a clearance review?",
    shortAnswer:
      "A clearance review is a professional review of whether making or selling a product may run into existing patents or other rights held by others.",
    detail:
      "It is a different question from whether an idea is new. Clearance reviews are performed by qualified professionals, not by search tools or preparation packets.",
  },
  {
    id: "freedom_to_operate",
    title: "What is a freedom-to-operate review?",
    shortAnswer:
      "A freedom-to-operate review is a professional analysis of whether a product can likely be made, used, or sold in a market without conflicting with active patents held by others.",
    detail:
      "It usually focuses on specific countries and product versions. Only a qualified professional can perform this kind of review.",
  },
  {
    id: "validity_search",
    title: "What is a validity search?",
    shortAnswer:
      "A validity search looks for prior art relevant to a patent that has already been granted, often to understand how strong the patent may be.",
    detail:
      "This type of search usually comes up later — for example, in disputes or licensing conversations — and is handled by professionals.",
  },
  {
    id: "pct",
    title: "What is the PCT?",
    shortAnswer:
      "The Patent Cooperation Treaty (PCT) is an international system that lets an applicant start the patent process in many countries with a single international application.",
    detail:
      "It does not grant a worldwide patent; each country or region still makes its own decision. Whether the PCT fits a situation is a question for a professional.",
  },
  {
    id: "fee_status",
    title: "What is micro or small entity fee status?",
    shortAnswer:
      "The USPTO offers reduced fee levels for applicants who qualify as a small entity or micro entity, based on factors like organization size and filing history.",
    detail:
      "Whether someone qualifies depends on specific rules. You may want to ask a professional about your status or review the USPTO's fee-status resources.",
  },
  {
    id: "patent_attorney_role",
    title: "What does a patent attorney do?",
    shortAnswer:
      "A patent attorney is a licensed lawyer, also registered with the USPTO, who can advise on patent matters, draft and file applications, and represent clients.",
    detail:
      "Patent agents are also USPTO-registered and can prepare and file patent applications, though they are not attorneys. Both review invention details, discuss options, and handle the filing process.",
  },
  {
    id: "search_firm_role",
    title: "What does a patent search firm do?",
    shortAnswer:
      "A patent search firm performs professional searches of patents and other publications to find references similar to an idea.",
    detail:
      "Firms typically deliver a report of what they found. Interpreting what the results mean is usually a separate conversation with a patent attorney or agent.",
  },
  {
    id: "after_filing",
    title: "What happens after a patent application is filed?",
    shortAnswer:
      "After filing, a patent examiner reviews the application, often sends questions or rejections called office actions, and the applicant responds — a process that commonly takes years.",
    detail:
      "Many applications go through several rounds of examination. A professional typically manages these responses and explains the options at each step.",
  },
];

export function getEducationCards(
  ids: string[],
): EducationCardContent[] {
  return ids
    .map((id) => EDUCATION_CARDS.find((card) => card.id === id))
    .filter((card): card is EducationCardContent => Boolean(card));
}
