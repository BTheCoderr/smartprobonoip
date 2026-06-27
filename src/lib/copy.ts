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
  builderTitle: "Packet Builder",
  builderProgress: "Building your packet",
  intro:
    "You do not need perfect answers yet. Start with what you know.",
  introDetail:
    "Each step adds another page to your IP Readiness Packet — not a form, but a dossier you can bring to your next conversation.",
  reviewTitle: "Review before we build your packet",
  reviewSubcopy:
    "Make sure the basics look right. You can edit anything before generating your IP Readiness Packet.",
  safetyLine:
    "SmartProBonoIP is preparation only and does not create an attorney-client relationship.",
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
  title: "Partner Impact Desk",
  lead: "See what inventors are preparing, where support is needed, and which signals appear most often.",
} as const;

export const LANDING_COPY = {
  heroStamp: "ACCESS TO IP",
  heroSafety:
    "SmartProBonoIP is preparation only and does not create an attorney-client relationship.",
  whyExists:
    "People do not always lose ideas because the ideas are weak. Sometimes they lose momentum because the first step is confusing, expensive, or hard to explain.",
  whyExistsLead:
    "SmartProBonoIP helps turn scattered notes into a structured packet — so the first step feels possible.",
  whoHelps: [
    "Inventors with rough sketches or prototypes",
    "Creators with brands, content, or digital work",
    "Founders building software or hardware",
    "Small businesses with product or process ideas",
    "Community programs supporting innovation access",
    "Clinics and partners reviewing intake before referrals",
  ],
  packetHelps: [
    {
      title: "Explain the idea",
      body: "Turn scattered notes into a plain-language summary anyone can follow.",
    },
    {
      title: "Spot what may matter",
      body: "See which IP topics may be relevant to discuss — starting points, not legal conclusions.",
    },
    {
      title: "Strengthen missing details",
      body: "Find gaps in your story before a professional or clinic asks about them.",
    },
    {
      title: "Prepare expert questions",
      body: "Walk in with questions you may want to ask — not answers you have to guess.",
    },
    {
      title: "Compare similar references",
      body: "Get search terms and prep worksheets for possible similar references only.",
    },
    {
      title: "Leave with a PDF handoff",
      body: "Download a structured packet to share with a mentor, clinic, or partner.",
    },
  ],
  whatWeDoNot:
    "We do not tell you whether your idea is patentable. We do not replace experts. We help you show up more prepared.",
  safetyLine: "We do not replace experts. We help people show up more prepared.",
  partnerCallout:
    "For clinics, libraries, innovation hubs, and community partners, SmartProBonoIP creates cleaner intake, stronger referrals, and better pilot data.",
  howItWorks: [
    "Answer plain-language questions",
    "Review and strengthen your idea",
    "Download an IP Readiness Packet",
    "Bring it to a professional, clinic, mentor, or partner",
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
} as const;

export const PILOT_KIT_COPY = {
  title: "Pilot demo kit",
  lead: "Everything you need to show SmartProBonoIP to partners, clinics, funders, and innovation programs in about two minutes.",
  sampleBanner:
    "Sample packet — fictional HydroSeal invention for demos only. Preparation help, not legal advice.",
  pilotPitch:
    "SmartProBonoIP is looking for 10–25 pilot users through a Rhode Island partner. The goal is to test whether IP Readiness Packets help inventors and creators show up more prepared before meeting a professional, clinic, mentor, or innovation partner.",
  partnerValue: [
    "Cleaner intake before referrals",
    "Better-prepared inventors and creators",
    "Readiness and clarity data for pilots",
    "Visibility into common support gaps",
    "PDF handoff packets for mentors and clinics",
  ],
  demoSteps: [
    {
      title: "Open the sample packet",
      body: "Show a finished IP Readiness Packet — idea summary, signals, questions, and next step — without completing intake.",
      href: "/smartprobonoip/sample",
    },
    {
      title: "Run demo intake",
      body: "Walk through the Packet Builder with the pre-loaded HydroSeal example, then generate a demo packet.",
      href: "/smartprobonoip/disclaimer?demo=1",
    },
    {
      title: "Download the PDF",
      body: "From the sample or demo packet page, download the handoff PDF a clinic or mentor could review.",
      href: "/smartprobonoip/sample",
    },
    {
      title: "Show the Partner Impact Desk",
      body: "Open the dashboard with demo data to show readiness signals, clarity trends, and CSV export.",
      href: "/smartprobonoip/dashboard?demo=1",
    },
  ],
  recoveryNote:
    "Non-demo packets can save a private recovery link (hashed server-side) so inventors can return from another browser. Demo packets do not create recovery records.",
  qrLinks: [
    { label: "Homepage", path: "/smartprobonoip" },
    { label: "Start a packet", path: "/smartprobonoip/disclaimer" },
    { label: "Demo mode", path: "/smartprobonoip/disclaimer?demo=1" },
    { label: "Sample packet", path: "/smartprobonoip/sample" },
    { label: "Partner dashboard", path: "/smartprobonoip/dashboard" },
  ],
  partnerQrLinks: [
    {
      label: "General start",
      path: "/smartprobonoip/disclaimer",
      query: { source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "SmartProBonoIP RI Pilot",
      path: "/smartprobonoip/disclaimer",
      query: {
        partner: "smartprobonoip-ri-pilot",
        source: "qr",
        campaign: "pilot-2026",
      },
    },
    {
      label: "RIHub",
      path: "/smartprobonoip/disclaimer",
      query: {
        partner: "rihub",
        source: "qr",
        campaign: "pilot-2026",
      },
    },
    {
      label: "Community IP",
      path: "/smartprobonoip/disclaimer",
      query: {
        partner: "communityip",
        source: "qr",
        campaign: "pilot-2026",
      },
    },
    {
      label: "Sample packet",
      path: "/smartprobonoip/sample",
      query: { source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "Partner dashboard",
      path: "/smartprobonoip/dashboard",
      query: {},
    },
  ],
} as const;
