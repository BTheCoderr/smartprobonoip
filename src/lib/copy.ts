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
  ownershipPrepTitle: "Ownership and agreement prep",
  ownershipPrepSubtitle:
    "What to gather before ownership or agreement conversations — preparation only, not an ownership determination.",
  miniPrepTitle: "Targeted prep sections",
  miniPrepSubtitle:
    "These mini-sections appear only when relevant to your answers. One packet, modular sections — preparation only, not legal advice.",
  researchPrepDisclaimer:
    "Research Prep Workspace helps you organize possible references and questions. It does not determine patentability, novelty, clearance, infringement, or legal rights.",
  similarReferenceSearchPrepTitle: "Similar Reference Search Prep",
  similarReferenceSearchPrepIntro:
    "Use this workspace to collect possible similar references before talking with a patent professional, clinic, mentor, or PTRC resource. This does not determine patentability, novelty, clearance, infringement, or legal rights.",
  savedSimilarReferencesTitle: "Saved Similar References",
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
  ownershipSectionTitle: "People and ownership",
  ownershipSectionHint:
    "Help organize who helped and what agreements may exist. This is preparation only — not an ownership determination.",
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
    "Preparation only. Not legal advice. No attorney-client relationship is created.",
  whyExists:
    "People do not always lose ideas because the ideas are weak. Sometimes they lose momentum because the first step is confusing, expensive, or hard to explain.",
  whyExistsLead:
    "SmartProBonoIP helps turn scattered notes into a structured packet — so the first step feels possible.",
  whoHelps: [
    "Inventors with rough sketches",
    "Creators with names, brands, or content",
    "Founders building software",
    "Small businesses with product ideas",
    "Community programs supporting innovation",
    "Clinics and partners reviewing intake",
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
    "SmartProBonoIP does not tell you whether your idea is patentable, clear your brand, or replace an expert. It helps you organize your thoughts before the expert conversation.",
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
  title: "SmartProBonoIP Rhode Island Pilot",
  subtitle: "Partner launch kit",
  lead: "A working pilot you can share with clinics, innovation hubs, funders, law firms, and community partners. Preparation only — not legal advice and not a legal conclusion.",
  whatItIs:
    "SmartProBonoIP helps inventors, creators, and small businesses turn scattered ideas into IP Readiness Packets before meeting a patent professional, clinic, mentor, or innovation partner. It organizes intake, surfaces starting-point signals, and produces a PDF handoff — without replacing experts.",
  whoItHelps: [
    "Inventors with rough sketches or prototypes",
    "Creators with brands, content, or digital work",
    "Founders building software or hardware",
    "Small businesses with product or process ideas",
    "Community programs supporting innovation access",
    "Clinics and partners reviewing intake before referrals",
  ],
  howPilotWorks: [
    {
      title: "Share a tracked link",
      body: "Partners distribute QR-ready URLs so intake is attributed to the right program or hub.",
    },
    {
      title: "10–25 pilot users complete intake",
      body: "Each user builds an IP Readiness Packet through plain-language questions — live or demo.",
    },
    {
      title: "Packets become handoff PDFs",
      body: "Users download structured packets and optional recovery links for return visits.",
    },
    {
      title: "Partners review impact data",
      body: "The Partner Impact Desk shows clarity lift, support needs, feedback, and CSV export.",
    },
  ],
  sampleBanner:
    "Sample packet — fictional HydroSeal invention for demos only. Preparation help, not legal advice.",
  pilotPitch:
    "We are looking for 10–25 pilot users through a Rhode Island partner to test whether IP Readiness Packets help people show up more prepared.",
  partnerValue: [
    "Cleaner intake before referrals",
    "Better-prepared referrals",
    "Readiness and clarity data",
    "Common support gaps",
    "PDF handoff packets",
    "Feedback and impact metrics",
  ],
  pilotMetrics: {
    title: "What we measure in the pilot",
    lead: "SmartProBonoIP tracks preparation outcomes — not legal conclusions — to help partners improve access to IP support.",
    items: [
      "Packet completion",
      "Clarity lift before and after the packet",
      "PDF downloads",
      "Recovery link usage",
      "Support needs selected by users",
      "Partner referral readiness signals",
      "Pilot feedback from users",
    ],
  },
  handout: {
    title: "SmartProBonoIP Rhode Island Pilot",
    coreLine:
      "SmartProBonoIP helps inventors, creators, and small businesses turn scattered ideas into IP Readiness Packets before meeting a patent professional, clinic, mentor, or innovation partner.",
    pilotAsk:
      "We are looking for 10–25 pilot users through a Rhode Island partner.",
    partnerValue: [
      "Cleaner intake",
      "Better-prepared referrals",
      "Readiness and clarity data",
      "Common support gaps",
      "PDF handoff packets",
      "Feedback and impact metrics",
    ],
    safety:
      "Preparation only. Not legal advice. Not a legal conclusion. Does not create an attorney-client relationship. Does not replace experts.",
  },
  demoWalkthrough: [
    {
      title: "Start with a messy idea",
      body: "Open the sample packet or start demo intake — show that perfect answers are not required.",
      href: "/smartprobonoip/sample",
    },
    {
      title: "Answer plain-language questions",
      body: "Walk through the Packet Builder: idea basics, how it works, materials, goals, and review.",
      href: "/smartprobonoip/disclaimer?demo=1",
    },
    {
      title: "Review the packet",
      body: "Show the IP Readiness Packet: summary, signals, questions, similar-reference prep, and next step.",
      href: "/smartprobonoip/sample",
    },
    {
      title: "Download PDF / save recovery link",
      body: "Download the handoff PDF. On a live packet, show optional private recovery for return visits.",
      href: "/smartprobonoip/sample",
    },
    {
      title: "Show dashboard impact data",
      body: "Open the Partner Impact Desk: funnel, clarity trends, feedback metrics, partner filters, and CSV export.",
      href: "/smartprobonoip/dashboard?demo=1",
    },
  ],
  outreach: [
    {
      audience: "Nathan",
      message:
        "I built a working SmartProBonoIP pilot and I'm looking for feedback and 10–25 test users. It helps people turn messy ideas into IP Readiness Packets before they meet a professional or clinic — preparation only, not legal advice. Can I show you the pilot kit and sample packet?",
    },
    {
      audience: "RIHub / innovation partner",
      message:
        "I built a working pilot tool for Rhode Island innovators. SmartProBonoIP creates IP Readiness Packets from plain-language intake and gives partners readiness data. I'm looking for feedback and 10–25 pilot users through a tracked partner link. Would RIHub be open to a short demo?",
    },
    {
      audience: "Law clinic / patent professional",
      message:
        "I built SmartProBonoIP to help inventors show up better prepared — organized summaries, starting-point signals, and PDF handoffs. It does not give legal advice or replace experts. I'm looking for feedback and 10–25 test users for a Rhode Island pilot. Would your clinic be open to reviewing a sample packet?",
    },
    {
      audience: "Community IP-style organization",
      message:
        "SmartProBonoIP helps community innovators turn scattered notes into IP Readiness Packets before referrals. I'm running a 10–25 user Rhode Island pilot and looking for a partner to share tracked intake links and review impact data. Preparation only — not legal advice.",
    },
    {
      audience: "Small law firm or IP attorney",
      message:
        "I built a pilot that organizes inventor intake into IP Readiness Packets — plain-language summaries, prep questions, and PDF handoffs. It may reduce time spent on basic organization. I'm looking for feedback and 10–25 test users. Does not create an attorney-client relationship.",
    },
  ],
  safetyPoints: [
    "Preparation only — not legal advice",
    "Not a legal conclusion about patentability, clearance, or infringement",
    "Does not create an attorney-client relationship",
    "Does not replace patent agents, attorneys, clinics, or mentors",
    "Signals and suggestions are starting points for your next conversation",
  ],
  recoveryNote:
    "Non-demo packets can save a private recovery link (hashed server-side) so inventors can return from another browser. Demo packets do not create recovery records.",
  launchQrLinks: [
    {
      label: "General pilot intake",
      path: "/smartprobonoip/disclaimer",
      query: { source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "SmartProBonoIP RI Pilot intake",
      path: "/smartprobonoip/disclaimer",
      query: {
        partner: "smartprobonoip-ri-pilot",
        source: "qr",
        campaign: "pilot-2026",
      },
    },
    {
      label: "RIHub pilot intake",
      path: "/smartprobonoip/disclaimer",
      query: { partner: "rihub", source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "Community IP partner intake",
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
      label: "Pilot launch kit (this page)",
      path: "/smartprobonoip/pilot",
      query: { source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "Partner dashboard",
      path: "/smartprobonoip/dashboard",
      query: {},
    },
  ],
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
} as const;

export function formatPilotHandoutText(): string {
  const h = PILOT_KIT_COPY.handout;
  return [
    h.title,
    "",
    h.coreLine,
    "",
    "Pilot ask",
    h.pilotAsk,
    "",
    "Partner value",
    ...h.partnerValue.map((item) => `• ${item}`),
    "",
    h.safety,
  ].join("\n");
}

export const FEEDBACK_COPY = {
  title: "Help us improve the pilot",
  subtitle:
    "Your answers help partners understand whether IP Readiness Packets are useful. This is not legal advice.",
  clarityQuestion: "Did this packet make your idea clearer?",
  expertQuestion:
    "Would you bring this packet to a patent professional, clinic, mentor, or innovation partner?",
  supportQuestion: "What support do you think you need next?",
  confusionQuestion: "What was confusing?",
  followUpQuestion:
    "Do you want someone from a pilot partner to follow up? (We may not be able to follow up in every case.)",
  demoNote:
    "Demo mode: feedback is shown for walkthroughs only and is not saved to the pilot database.",
  submit: "Submit pilot feedback",
  thanks: "Thanks — your feedback helps improve the pilot.",
} as const;

export const ROUTING_COPY = {
  title: "Resource types that may help next",
  subtitle:
    "Based on your packet, goals, and support needs — starting points only.",
  safety:
    "These suggestions do not mean you qualify for any program. Consider asking a partner or professional about options that may fit your situation.",
} as const;
