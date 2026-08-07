/**
 * Patent-path educational content — preparation framing only.
 * No legal conclusions, deadlines, or filing recommendations.
 */

export interface PatentEducationTopic {
  id: string;
  title: string;
  summary: string;
  points: readonly string[];
  safetyNote: string;
}

export const PATENT_EDUCATION_TOPICS: readonly PatentEducationTopic[] = [
  {
    id: "privacy_public_disclosure",
    title: "Privacy and public disclosure",
    summary:
      "What you share — and when — can matter in later professional conversations. SmartProBonoIP helps you record sharing history; it does not decide legal consequences.",
    points: [
      "Public posts, pitches, demos, sales, crowdfunding, and conference talks are common examples of sharing that professionals may want to review.",
      "Private conversations under confidentiality may be different from public sharing — note both, including approximate dates.",
      "Keeping detailed invention information private until you talk with a professional is a common preparation practice, not a legal rule from this tool.",
      "If you already shared something, write down when, where, who saw it, and what details were shown — that helps an expert ask better questions.",
    ],
    safetyNote:
      "SmartProBonoIP does not determine whether a disclosure affects rights, starts a deadline, or requires filing. Only a qualified professional can advise on your situation.",
  },
  {
    id: "ai_inventorship",
    title: "AI tools and inventorship",
    summary:
      "AI tools may help write, sketch, or explore ideas — but inventorship questions are about human contribution. This section helps you organize facts for a professional, not decide inventorship.",
    points: [
      "Note whether generative AI helped draft text, generate designs, suggest mechanisms, or write code related to the invention.",
      "Describe the human contributions: who defined the problem, chose the approach, designed the solution, or improved the result.",
      "List people who contributed to the inventive idea separately from people who only provided funding, manufacturing, or general feedback when you can.",
      "USPTO and other offices have published guidance on AI-assisted inventions; a registered patent practitioner can explain what that means for your facts.",
    ],
    safetyNote:
      "This tool does not decide who is an inventor, whether AI can be listed, or how to complete inventorship paperwork. Bring your notes to a registered patent agent or attorney.",
  },
  {
    id: "idf_basics",
    title: "What an invention disclosure form organizes",
    summary:
      "An invention disclosure (IDF-style) packet gathers the story a professional often needs: what was created, how it works, alternatives, sharing history, contributors, and supporting materials.",
    points: [
      "Plain-language title and summary of the invention",
      "Problem solved and how the solution works",
      "Preferred version and known alternatives or variations",
      "What already exists that seems similar (in your own words)",
      "Timeline of conception, prototypes, and public or private sharing",
      "People who helped, agreements, and any AI assistance notes",
      "Drawings, photos, prototypes, and other materials you already have",
    ],
    safetyNote:
      "Completing these fields prepares you for expert review. It is not a patent application and does not create legal protection by itself.",
  },
] as const;

export function getPatentEducationTopic(
  id: string,
): PatentEducationTopic | undefined {
  return PATENT_EDUCATION_TOPICS.find((topic) => topic.id === id);
}
