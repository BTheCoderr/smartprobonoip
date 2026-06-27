export const PACKET_COPY = {
  ideaAtGlance: "Your idea at a glance",
  signalsSection: "What your idea may touch",
  signalsSubtitle: "These are starting points, not legal conclusions.",
  missingInfoTitle: "What to strengthen before your next conversation",
  expertPrepTitle: "Questions to bring with you",
  resourcesTitle: "Places that may help",
  patentPrepTitle: "Patent conversation prep",
  similarRefPrepTitle: "Similar reference prep",
  readinessSnapshotTitle: "Readiness snapshot",
  nextBestStepTitle: "Your next best step",
  coreCompleteOptionalGaps:
    "You gave enough to create a first packet. These extra details could make your next conversation stronger.",
  coreComplete: "Core intake is complete.",
  coreNeedsAttention: (count: number) =>
    `${count} core intake item${count === 1 ? "" : "s"} still need attention.`,
} as const;

export const COACH_COPY = {
  intro:
    "Stuck on how to explain it? The AI Packet Coach can help you sharpen your answers, find missing details, and prepare questions before you talk to a professional.",
} as const;

export const INTAKE_COPY = {
  intro:
    "You do not need perfect answers yet. Start with what you know. SmartProBonoIP will help organize the idea, spot missing pieces, and prepare a packet you can bring to the next person.",
  reviewTitle: "Review before we build your packet",
  reviewSubcopy:
    "Make sure the basics look right. You can edit anything before generating your IP Readiness Packet.",
} as const;

export const LANDING_COPY = {
  valueCards: [
    {
      title: "Organize the idea",
      body: "Turn scattered notes into a clear plain-language summary of what you built and who it is for.",
    },
    {
      title: "Spot what may matter",
      body: "See which IP topics may be relevant to discuss — as starting points, not legal conclusions.",
    },
    {
      title: "Prepare for the next conversation",
      body: "Get questions, checklists, and suggested resources before you meet a professional or clinic.",
    },
  ],
  howItWorks: [
    "Answer plain-language questions",
    "Review and strengthen your idea",
    "Download an IP Readiness Packet",
    "Bring it to a professional, clinic, mentor, or partner",
  ],
} as const;
