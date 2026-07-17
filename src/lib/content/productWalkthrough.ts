export type WalkthroughStepId =
  | "guided-intake"
  | "organize-story"
  | "missing-information"
  | "readiness-packet"
  | "professional-review";

export interface ProductWalkthroughStep {
  id: WalkthroughStepId;
  step: number;
  title: string;
  caption: string;
  imageSrc: string;
  imageAlt: string;
}

export const PRODUCT_WALKTHROUGH_COPY = {
  kicker: "Screenshot tour",
  title: "Explore the product in real screenshots",
  lead: "See guided intake, readiness review, packet generation, and professional handoff — captured from the live product.",
  ctaLabel: "Become a SmartProBonoIP pilot partner",
  ctaHref: "/pilot#pilot-application",
  previousLabel: "Previous step",
  nextLabel: "Next step",
} as const;

export const PRODUCT_WALKTHROUGH_STEPS: ProductWalkthroughStep[] = [
  {
    id: "guided-intake",
    step: 1,
    title: "Start the guided intake",
    caption:
      "The inventor begins with the problem, proposed solution, and core idea.",
    imageSrc: "/product-proof/walkthrough/01-guided-intake.png",
    imageAlt:
      "SmartProBonoIP Packet Builder step 1 of 5 showing the Your Idea intake with demo mode and progress at 20 percent",
  },
  {
    id: "organize-story",
    step: 2,
    title: "Organize the invention story",
    caption:
      "SmartProBonoIP structures key features, possible alternatives, inventor information, and supporting materials.",
    imageSrc: "/product-proof/walkthrough/02-organize-story.png",
    imageAlt:
      "SmartProBonoIP intake wizard organizing timeline, disclosures, and invention details into structured packet sections",
  },
  {
    id: "missing-information",
    step: 3,
    title: "Surface missing information",
    caption:
      "The workflow identifies gaps and prepares clearer questions for the next professional conversation.",
    imageSrc: "/product-proof/walkthrough/03-missing-information.png",
    imageAlt:
      "SmartProBonoIP readiness report showing organization score, missing info count, and interactive packet review gaps",
  },
  {
    id: "readiness-packet",
    step: 4,
    title: "Generate the IP Readiness Packet",
    caption:
      "The inventor’s information is turned into one organized, review-ready handoff.",
    imageSrc: "/product-proof/walkthrough/04-readiness-packet.png",
    imageAlt:
      "SmartProBonoIP sample IP Readiness Packet overview for the HydroSeal demo with summary and dossier sections",
  },
  {
    id: "professional-review",
    step: 5,
    title: "Professional review",
    caption:
      "The professional receives a better prepared inventor without rebuilding the intake from zero.",
    imageSrc: "/product-proof/walkthrough/05-professional-review.png",
    imageAlt:
      "SmartProBonoIP sample packet handoff card with Start from this sample, Download IP Readiness Packet, and Export professional JSON for expert review",
  },
];
