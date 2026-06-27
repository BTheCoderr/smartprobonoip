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
    "You do not need perfect answers yet. Start with what you know.",
  introDetail:
    "SmartProBonoIP will help organize the idea, spot missing pieces, and prepare a packet you can bring to the next person.",
  reviewTitle: "Review before we build your packet",
  reviewSubcopy:
    "Make sure the basics look right. You can edit anything before generating your IP Readiness Packet.",
} as const;

export const RECOVERY_COPY = {
  title: "Want to come back later?",
  body: "Save a private recovery link so you can return to this packet from another browser. Keep the link private — anyone with it can open your packet.",
  create: "Create recovery link",
  copy: "Copy link",
  email: "Email me the link",
  emailUnavailable:
    "Email delivery is not configured yet. Copy your link and store it somewhere safe.",
  created: "Recovery link created. Copy it now — we cannot show it again.",
  demoDisabled: "Recovery links are not created for demo packets.",
  localDisabled:
    "Recovery links require cloud storage. Complete intake when Supabase is configured.",
} as const;

export const DASHBOARD_COPY = {
  lead: "See what inventors are preparing, where they need support, and which signals appear most often.",
} as const;

export const LANDING_COPY = {
  whyExists:
    "Many people have strong ideas but do not know how to explain them, document them, or prepare for the first IP conversation. SmartProBonoIP helps turn scattered notes into a structured packet.",
  whoHelps: [
    "Inventors with a product, process, or prototype",
    "Creators building apps, brands, or content",
    "Founders preparing for clinics, mentors, or partners",
    "Small businesses organizing before an IP conversation",
    "Students and community innovators with limited access",
  ],
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
  whatYouGet: [
    {
      title: "Plain-language idea summary",
      body: "A readable overview of what you created, who it is for, and how it works.",
    },
    {
      title: "IP & business protection signals",
      body: "Starting points for what your idea may touch — not legal conclusions.",
    },
    {
      title: "Missing-info checklist",
      body: "What to strengthen before your next conversation.",
    },
    {
      title: "Expert questions",
      body: "Questions to bring with you to a clinic, mentor, or professional.",
    },
    {
      title: "Similar reference prep",
      body: "Search terms and worksheets for possible similar references only.",
    },
    {
      title: "PDF handoff packet",
      body: "Download a structured packet to share with a professional or partner.",
    },
  ],
  whatWeDoNot: [
    "We do not provide legal advice or legal conclusions.",
    "We do not replace patent agents, attorneys, clinics, or mentors.",
    "We do not determine patentability, clearance, or infringement.",
    "We do not file applications or make filing recommendations.",
  ],
  safetyLine: "We do not replace experts. We help people show up more prepared.",
  partnerCallout:
    "Pilot partners — clinics, libraries, accelerators, and innovation hubs — use SmartProBonoIP to see what inventors are preparing and where they may need support.",
  howItWorks: [
    "Answer plain-language questions",
    "Review and strengthen your idea",
    "Download an IP Readiness Packet",
    "Bring it to a professional, clinic, mentor, or partner",
  ],
} as const;
