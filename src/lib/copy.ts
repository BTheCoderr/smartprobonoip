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
    "Use this workspace to collect possible similar references before talking with a patent professional, clinic, mentor, or PTRC resource. This does not determine patentability, novelty, clearance, infringement, or legal rights.",
  similarReferenceSearchPrepTitle: "Similar Reference Search + Gap Map",
  similarReferenceSearchPrepIntro:
    "Search for possible similar products, patents, brand names, designs, and web references. Save what you find, compare what looks similar, and write questions for an expert. This does not determine patentability, clearance, infringement, or legal rights.",
  savedSimilarReferencesTitle: "Saved Similar References",
  materialsChecklistSubtitle:
    "Based on your intake answers. Use Edit packet to update what materials you have.",
  differenceMapSubtitle:
    "Based on your intake answers — user-described differences only, not a legal conclusion.",
  coreCompleteOptionalGaps:
    "You gave enough to create a first packet. These extra details could make your next conversation stronger.",
  coreComplete: "Core intake is complete.",
  coreNeedsAttention: (count: number) =>
    `${count} core intake item${count === 1 ? "" : "s"} still need attention.`,
  disclosureEventsTableTitle: "Sharing events you recorded",
  disclosureGuidance:
    "Sharing history can be time-sensitive; a professional may want to review your dates before any filing or broader disclosure decision.",
  searchReadinessTitle: "In your words",
  searchReadinessSubtitle:
    "Search prep details you described during intake — used to build your starter search queries.",
  searchFirmQuestionsTitle: "Questions for a search firm or patent professional",
  searchFirmQuestionsSubtitle:
    "Neutral questions people commonly ask before or during a professional search conversation.",
  pathwayTitle: "A common preparation pathway",
  resourceTypesTitle: "Types of resources that exist",
} as const;

export const COACH_COPY = {
  intro:
    "Stuck on how to explain it? The AI Packet Coach can help you sharpen your answers, find missing details, and prepare questions before you talk to a professional.",
} as const;

export const INTAKE_COPY = {
  builderTitle: "Invention Disclosure Builder",
  builderProgress: "Building your invention disclosure packet",
  intro:
    "You do not need perfect answers yet. Start with what you know.",
  introDetail:
    "Each step adds another page to your IP Readiness Packet — an invention-disclosure-style dossier you can bring to a patent agent, attorney, clinic, or mentor.",
  reviewTitle: "Review before we build your packet",
  reviewSubcopy:
    "Make sure the basics look right. You can edit anything before generating your IP Readiness Packet.",
  safetyLine:
    "SmartProBonoIP is preparation only and does not create an attorney-client relationship.",
  ownershipSectionTitle: "People and ownership",
  ownershipSectionHint:
    "Help organize who helped and what agreements may exist. This is preparation only — not an ownership determination.",
  draftSaved: "Draft saved on this device",
  draftRestored: "We restored your last draft from this browser.",
  saveAndExit: "Progress saved. Return anytime from Start free packet.",
  wizard: {
    idfFramingTitle:
      "Invention disclosure basics — organize facts a professional may want to review",
    ideaCoreNote:
      "Three answers to continue — what you created, who it is for, and how it works. Optional disclosure details (preferred version, alternatives, similar work) strengthen your handoff packet.",
    ideaOptionalNote:
      "Optional IDF-style details — preferred version, alternatives, differences, and known similar work. Skip if unsure; you can add these anytime before export.",
    ideaItemTypeHint:
      "Optional category for packet sections — defaults are fine to leave as-is.",
    timelineNote:
      "Public sharing and collaborator details help professionals ask better questions. Keeping invention details private until expert review is a common preparation practice — this tool does not decide legal consequences.",
    searchPrepLead:
      "Start with Google Patents when you explore possible similar references. You can skip this preview — the full workspace is in your packet.",
    searchReadinessTitle: "In your words: search prep (optional)",
    searchReadinessHint:
      "These optional questions help your packet build better starter search queries from your own words. Answer any that feel easy — skip the rest.",
    disclosureEventsTitle: "Have you shown it to anyone? (optional)",
    disclosureEventsHint:
      "Add anyone you have shown the idea to — demos, pitches, friends, posts. Approximate dates are fine. This helps a professional understand your sharing history.",
    aiInventorshipTitle: "AI tools and inventorship notes",
    aiInventorshipHint:
      "If generative AI helped draft, sketch, code, or explore the idea, note it here. This organizes facts for a registered patent practitioner — it does not decide inventorship.",
  },
  fieldExamples: {
    whatCreated:
      "A portable water bottle with a twist-lock seal and replaceable filter cartridge.",
    problemSolved:
      "Hikers and travelers need clean water without carrying bulky filter gear.",
    whoFor: "Outdoor enthusiasts, travelers, and emergency-prep households.",
    howItWorks:
      "Water passes through a sealed cartridge when the user squeezes or sips; the seal prevents leaks during transport.",
    mainParts:
      "Bottle body, twist-lock lid, replaceable filter cartridge, silicone gasket.",
    whatDifferent:
      "Combines a field-replaceable cartridge with a leak-proof seal in one compact bottle form factor.",
    location: "Providence, Rhode Island, USA",
  },
} as const;

export const PRODUCT_COPY = {
  exportGuidance: {
    title: "What to do with your packet next",
    steps: [
      "Review the PDF for accuracy — edit your packet if anything looks incomplete.",
      "Save 1–3 possible similar references in Search Prep before your expert meeting.",
      "Share the PDF or attorney export with a clinic, mentor, or IP professional.",
      "Bring your expert questions and gap map notes to the conversation.",
    ],
    disclaimer:
      "Preparation only — not legal advice. A qualified professional should review all details.",
  },
} as const;

export const RECOVERY_COPY = {
  title: "Want to come back later?",
  body: "Save a private recovery link so you can return to this packet from another browser. Keep the link private — anyone with it can open your packet, and new links work only once.",
  create: "Create recovery link",
  copy: "Copy link",
  email: "Email me the link",
  emailUnavailable:
    "Email delivery is not configured yet. Copy your link and store it somewhere safe.",
  created:
    "Recovery link created. Copy it now — we cannot show it again, and it works only once.",
  demoDisabled: "Recovery links are not created for demo packets.",
  localDisabled:
    "Recovery links require cloud storage. Complete intake when Supabase is configured.",
} as const;

export const DASHBOARD_COPY = {
  title: "Partner Impact Desk",
  lead: "See what inventors are preparing, where support is needed, and which signals appear most often.",
} as const;

export const RESEARCH_PREP_COPY = {
  workspaceTitle: "Similar Reference Search Prep",
  helperTitle: "How to use this workspace",
  helperSteps: [
    "Start with grouped search queries below — copy a query or open an outbound search tool.",
    "Save possible similar references you find (title, link, and what looks similar or different).",
    "Use the gap map on each saved reference to note overlaps and questions for expert review.",
    "Bring your saved references and packet PDF to your next conversation — preparation only.",
  ],
  helperNote:
    "This workspace helps you prepare for similar-reference research before meeting a patent professional, clinic, mentor, or PTRC resource. It does not determine patentability, novelty, clearance, infringement, or legal rights.",
  outboundToolsTitle: "Outbound search tools",
  outboundToolsLead:
    "Open these resources in a new tab and paste a starter query. Results are for preparation only — not legal conclusions or patentability opinions.",
  outboundToolsRecommended:
    "Start with Google Patents — then use USPTO or The Lens if you need formal US documents or scholarly coverage. Save what you find as possible similar references.",
  outboundToolsGooglePatentsLead:
    "Google Patents is the recommended first stop for most inventors. Open it with a starter query, then save possible similar references in your packet.",
  outboundToolsSecondary:
    "Additional patent, product, and web resources if you want broader coverage.",
  outboundToolsOptional:
    "PQAI is an optional free AI tool with a limited free tier. Use it to explore starter search angles only — verify anything important with an expert.",
  groupedQueriesTitle: "Grouped starter queries",
  groupedQueriesLead:
    "Based on your packet answers. Try several angles — broad and specific — when exploring possible similar references.",
  gapMapHelperTitle: "Gap map tips",
  gapMapHelperBody:
    "For each saved reference, note what may overlap and what may differ in plain language. Use this to prepare expert questions — not to decide legal outcomes.",
  cpcTitle: "Suggested classification areas to discuss",
  cpcDisclaimer:
    "CPC examples (e.g. B01D for filters, A45F for outdoor gear) are keyword-derived conversation starters only. They are not classification opinions, patentability assessments, or filing recommendations.",
  cpcEmpty:
    "Add more detail about your invention to see suggested classification areas for expert conversation.",
  saveReferenceHelper:
    "When you find a possible similar reference, save the title, link, search query used, and your notes on what looks similar or different.",
  similarReferenceSection: {
    title: "Similar Reference Search Prep",
    lead: "Grouped starter queries, recommended outbound tools (Google Patents, USPTO, The Lens), gap maps, and CPC conversation starters (e.g. B01D / A45F for HydroSeal) — preparation only, not a patentability opinion.",
  },
} as const;

export const LANDING_COPY = {
  heroStamp: "IP READINESS PLATFORM",
  heroSafety: "Preparation only — not legal advice.",
  heroSubcta: "Patent readiness available now · Free to start · No account required · ~14 minutes",
  ctaPrimary: "Start patent readiness",
  ctaSample: "View sample packet",
  ctaHowItWorks: "See how it works",
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
    {
      title: "Describe your idea in plain language",
      body: "Answer guided questions about what you built, who it is for, and how it works — no perfect answers required.",
    },
    {
      title: "Organize timeline, materials, and key details",
      body: "Build a development timeline, materials checklist, and readiness snapshot as you go.",
    },
    {
      title: "Review suggested similar-reference prompts + CPC areas",
      body: "Use grouped starter queries, outbound search tools, and suggested classification areas (e.g. B01D, A45F) to discuss with an expert — not legal conclusions.",
    },
    {
      title: "Download a packet for expert conversation",
      body: "Export a structured PDF handoff for a patent professional, clinic, mentor, or innovation partner.",
    },
  ],
  productProof: [
    {
      variant: "builder" as const,
      title: "Packet Builder",
      body: "Five-step wizard with save & continue — HydroSeal demo shown below.",
      sampleAnchor: "builder",
    },
    {
      variant: "snapshot" as const,
      title: "Readiness snapshot",
      body: "Organization score and gaps before expert review — from the live HydroSeal sample.",
      sampleAnchor: "snapshot",
    },
    {
      variant: "search" as const,
      title: "Similar Reference Search + Gap Map",
      body: "Google Patents first, grouped queries, and gap maps — preparation only.",
      sampleAnchor: "search",
    },
    {
      variant: "pdf" as const,
      title: "PDF & attorney export",
      body: "Download a handoff packet or structured JSON for your expert conversation.",
      sampleAnchor: "export",
    },
  ],
  productProofLead:
    "Screens below use the fictional HydroSeal demo packet — the same example you can open, download, or start from.",
  productProofMediaNote:
    "Add real screenshots or a short clip under public/product-proof/ when available. Until then, interactive UI previews are shown.",
  socialProofEmptyLead:
    "Partner quotes and logos will appear here once we have permission to share them.",
  trustQuotes: [] as const,
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
      title: "Readiness snapshot",
      body: "A quick view of what is organized and what may still need attention.",
    },
    {
      title: "Development timeline",
      body: "Dates and milestones you can review with an expert — preparation only.",
    },
    {
      title: "Materials checklist",
      body: "Sketches, code, photos, and other materials to gather before your next conversation.",
    },
    {
      title: "Similar reference prep",
      body: "Search terms and worksheets for possible similar references only.",
    },
    {
      title: "Gap map",
      body: "Notes on what may look similar and what you think is different — not legal conclusions.",
    },
    {
      title: "Questions for expert review",
      body: "Questions to bring with you to a clinic, mentor, or professional.",
    },
    {
      title: "Suggested resource categories",
      body: "Starting points for programs or professionals that may fit your goals.",
    },
    {
      title: "PDF handoff",
      body: "Download a structured packet to share with a professional or partner.",
    },
  ],
  audienceCards: [
    {
      title: "Inventors & founders",
      body: "Organize a messy idea into a readiness packet before your first conversation with a patent professional, clinic, or mentor.",
    },
    {
      title: "Clinics & pro bono programs",
      body: "Receive cleaner intake with timelines, materials lists, similar-reference notes, and inventor-prepared questions.",
    },
    {
      title: "Innovation hubs & universities",
      body: "Help founders and student inventors show up prepared before PTRC, clinic, or mentor referrals.",
    },
    {
      title: "IP professionals",
      body: "Review structured exports and PDF handoffs that may reduce repetitive back-and-forth on basic organization.",
    },
  ],
  trustPoints: [
    "SmartProBonoIP is not a law firm and does not provide legal advice",
    "Preparation tool only — not patentability, clearance, or filing opinions",
    "Packet data stays in your session; exports happen only when you choose",
    "Public analytics exclude invention descriptions, emails, and recovery tokens",
    "Suggested CPC areas and search tools are conversation starters for expert review",
  ],
  founder: {
    name: "Baheem Ferrell",
    bio: "Built by Baheem Ferrell, a software builder focused on access to legal and IP preparation tools for overlooked innovators.",
    extended:
      "SmartProBonoIP started from a simple observation: good ideas stall when the first IP conversation feels confusing or out of reach. This tool organizes information before expert review — it does not replace patent agents, attorneys, clinics, or mentors.",
  },
  riPilotTeaser: {
    title: "Now seeking Rhode Island pilot partners",
    body: "Innovation hubs, universities, clinics, IP professionals, and entrepreneur support organizations can pilot SmartProBonoIP as an IP readiness pre-intake layer.",
    cta: "Explore a pilot",
  },
  footerDisclaimer:
    "Educational preparation only. Not legal advice. Not a substitute for a qualified patent agent, attorney, or other professional.",
} as const;

/**
 * Drop-in media paths for homepage product proof.
 * Set a path when a real asset exists (e.g. "/product-proof/builder.png").
 * Leave null to keep the interactive UI preview fallback — never invent proof.
 */
export const PRODUCT_PROOF_MEDIA: {
  builder: string | null;
  snapshot: string | null;
  search: string | null;
  pdf: string | null;
} = {
  builder: null,
  snapshot: null,
  search: null,
  pdf: null,
};

/**
 * Named quotes and partner logos — leave empty until permission exists.
 * Do not invent names, logos, or fake endorsements.
 */
export const SOCIAL_PROOF_SLOT: {
  quotes: Array<{ quote: string; name: string; role: string; org?: string }>;
  logos: Array<{ name: string; src: string; href?: string }>;
} = {
  quotes: [],
  logos: [],
};

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
  sampleStartCta: "Start with this example",
  sampleStartOwnCta: "Start your own packet",
  sampleStartHint:
    "Pre-loads the HydroSeal demo in the packet builder — edit anything, then generate your own packet.",
  sampleStartOwnHint:
    "Begin a blank packet for your idea. Same steps as the sample — your answers instead of HydroSeal.",
  similarReferencePrepBlurb:
    "Inventors can use grouped starter queries, outbound search tools (Google Patents, USPTO, WIPO, Espacenet, The Lens, PQAI), gap maps, and suggested CPC areas (e.g. B01D, A45F) as preparation only — not legal conclusions.",
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
      href: "/sample",
    },
    {
      title: "Answer plain-language questions",
      body: "Walk through the Packet Builder: idea basics, how it works, materials, goals, and review.",
      href: "/disclaimer?demo=1",
    },
    {
      title: "Review the packet",
      body: "Show the IP Readiness Packet: summary, signals, questions, similar-reference prep, and next step.",
      href: "/sample",
    },
    {
      title: "Download PDF / save recovery link",
      body: "Download the handoff PDF. On a live packet, show optional private recovery for return visits.",
      href: "/sample",
    },
    {
      title: "Show dashboard impact data",
      body: "Open the Partner Impact Desk: funnel, clarity trends, feedback metrics, partner filters, and CSV export.",
      href: "/dashboard?demo=1",
    },
  ],
  outreach: [
    {
      audience: "Patent professional (warm intro)",
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
      path: "/disclaimer",
      query: { source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "SmartProBonoIP RI Pilot intake",
      path: "/disclaimer",
      query: {
        partner: "smartprobonoip-ri-pilot",
        source: "qr",
        campaign: "pilot-2026",
      },
    },
    {
      label: "RIHub pilot intake",
      path: "/disclaimer",
      query: { partner: "rihub", source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "Community IP partner intake",
      path: "/disclaimer",
      query: {
        partner: "communityip",
        source: "qr",
        campaign: "pilot-2026",
      },
    },
    {
      label: "Sample packet",
      path: "/sample",
      query: { source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "Pilot launch kit (this page)",
      path: "/pilot",
      query: { source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "Partner dashboard",
      path: "/dashboard",
      query: {},
    },
  ],
  qrLinks: [
    { label: "Homepage", path: "/" },
    { label: "Start a packet", path: "/disclaimer" },
    { label: "Demo mode", path: "/disclaimer?demo=1" },
    { label: "Sample packet", path: "/sample" },
    { label: "Partner dashboard", path: "/dashboard" },
  ],
  partnerQrLinks: [
    {
      label: "General start",
      path: "/disclaimer",
      query: { source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "SmartProBonoIP RI Pilot",
      path: "/disclaimer",
      query: {
        partner: "smartprobonoip-ri-pilot",
        source: "qr",
        campaign: "pilot-2026",
      },
    },
    {
      label: "RIHub",
      path: "/disclaimer",
      query: {
        partner: "rihub",
        source: "qr",
        campaign: "pilot-2026",
      },
    },
    {
      label: "Community IP",
      path: "/disclaimer",
      query: {
        partner: "communityip",
        source: "qr",
        campaign: "pilot-2026",
      },
    },
    {
      label: "Sample packet",
      path: "/sample",
      query: { source: "qr", campaign: "pilot-2026" },
    },
    {
      label: "Partner dashboard",
      path: "/dashboard",
      query: {},
    },
  ],
  demoSteps: [
    {
      title: "Open the sample packet",
      body: "Show a finished IP Readiness Packet — idea summary, signals, questions, and next step — without completing intake.",
      href: "/sample",
    },
    {
      title: "Run demo intake",
      body: "Walk through the Packet Builder with the pre-loaded HydroSeal example, then generate a demo packet.",
      href: "/disclaimer?demo=1",
    },
    {
      title: "Download the PDF",
      body: "From the sample or demo packet page, download the handoff PDF a clinic or mentor could review.",
      href: "/sample",
    },
    {
      title: "Show the Partner Impact Desk",
      body: "Open the dashboard with demo data to show readiness signals, clarity trends, and CSV export.",
      href: "/dashboard?demo=1",
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

export const PROFESSIONALS_COPY = {
  title: "For IP Professionals & Partner Organizations",
  subtitle: "Integrations & exports",
  lead: "Pilot SmartProBonoIP as an IP readiness pre-intake layer. Inventors arrive with organized summaries, timelines, materials lists, similar-reference notes, and expert questions — preparation only, not legal advice.",
  positioning:
    "SmartProBonoIP helps inventors, founders, clinics, innovation hubs, and IP professionals organize invention summaries, timelines, materials, similar-reference notes, and expert questions before a patent professional or IP resource reviews the matter.",
  corePromise:
    "Preparation only. Not legal advice. Not patentability, clearance, or filing opinions. Does not create an attorney-client relationship.",
  audiences: [
    {
      title: "Patent agents & IP attorneys",
      body: "Review cleaner intake before the first conversation. Structured exports may reduce repetitive back-and-forth on basic organization.",
    },
    {
      title: "Law clinics & pro bono programs",
      body: "Receive clearer referral materials, readiness snapshots, and inventor-prepared questions before clinic review.",
    },
    {
      title: "Innovation hubs & universities",
      body: "Help founders and student inventors show up prepared before PTRC, clinic, or mentor referrals.",
    },
    {
      title: "Economic development & mentor networks",
      body: "Use tracked pilot links and readiness metrics to measure whether preparation support is working.",
    },
  ],
  valuePoints: [
    "Plain-language idea summaries organized before your review",
    "Development timelines and public-disclosure notes (user-reported)",
    "Materials checklists and prototype status flags",
    "Similar-reference prep with suggested search terms",
    "Suggested classification areas (e.g. B01D, A45F) as conversation starters only",
    "Gap maps and inventor-prepared expert questions",
    "Readiness score (0–100) based on packet completeness — not legal merit",
    "PDF, JSON, and optional CSV export from completed packets",
  ],
  exportIntro:
    "On any completed IP Readiness Packet, inventors can use Export for Attorney to download handoff files. The recipient email or firm name is recorded in export_metadata only — no automated delivery to third parties.",
  exportFormats: [
    {
      title: "PDF packet",
      mime: "application/pdf",
      filename: "smartprobonoip-ip-readiness-packet-{packet_id}.pdf",
      body: "The existing high-quality handoff PDF — unchanged. Includes idea summary, readiness snapshot, timeline, materials, similar-reference prep, expert questions, and disclaimers.",
    },
    {
      title: "Structured JSON",
      mime: "application/json",
      filename: "smartprobonoip-attorney-export-{packet_id}.json",
      body: "Machine-readable attorney export matching the schema below. UTF-8, pretty-printed. All fields derive from inventor intake and saved workspace data.",
    },
    {
      title: "CSV summary",
      mime: "text/csv",
      filename: "smartprobonoip-attorney-export-{packet_id}.csv",
      body: "Two-column field/value export for quick spreadsheet review. Includes flattened timeline, prior art, gaps, and JSON-encoded inventorship_split.",
    },
  ],
  cpcNote:
    "cpc_suggestions are keyword-derived starting points for expert conversation (e.g. HydroSeal portable filter → B01D filters, A45F outdoor gear). They are not classification opinions, patentability assessments, or filing recommendations.",
  schemaFields: [
    { field: "disclaimer", type: "object", description: "Full disclaimer at top: paragraphs (DISCLAIMER text), short, and attorney_export_notice." },
    { field: "packet_id", type: "string", description: "Unique project identifier." },
    { field: "created_at", type: "ISO 8601 date", description: "When the packet was first created." },
    { field: "readiness_score", type: "number (0–100)", description: "Completeness score from intake, materials, timeline, and reference prep — not legal merit." },
    { field: "inventor.name", type: "string", description: "Inventor name if provided (often empty until collected)." },
    { field: "inventor.email", type: "string", description: "Inventor email if provided (often empty)." },
    { field: "inventor.entity", type: "string", description: "Location or entity context from intake." },
    { field: "inventor.inventorship_split", type: "array", description: "Ownership prep: role, involvement type, help types, notes." },
    { field: "invention.title", type: "string", description: "Short idea label from intake." },
    { field: "invention.summary", type: "string", description: "Plain-language idea summary from the readiness profile." },
    { field: "invention.problem_solved", type: "string", description: "User-described problem statement." },
    { field: "invention.how_it_works", type: "string", description: "User-described workflow or mechanism." },
    { field: "invention.key_components", type: "string[]", description: "Parsed main parts / components." },
    { field: "invention.differences", type: "string[]", description: "User-described differences and gap-map notes." },
    { field: "timeline.conception_date", type: "date | null", description: "From development timeline (idea started or first written/sketched)." },
    { field: "timeline.reduction_to_practice", type: "date | null", description: "From development timeline (first prototype built)." },
    { field: "timeline.public_disclosures", type: "array", description: "User-reported dates and sharing-channel events." },
    { field: "prior_art.user_notes", type: "string", description: "Concatenated notes from saved similar references." },
    { field: "prior_art.suggested_search_terms", type: "string[]", description: "Keywords and suggested queries from search prep." },
    { field: "prior_art.cpc_suggestions", type: "string[]", description: "Keyword-derived CPC areas for discussion — not legal conclusions." },
    { field: "materials.attachments", type: "array", description: "{ name, url, type } — asset types plus saved reference URLs." },
    { field: "materials.prototype_status", type: "string", description: "Whether a prototype was reported." },
    { field: "gaps_and_questions", type: "string[]", description: "Missing info, optional gaps, and expert questions." },
    { field: "recommended_resources", type: "string[]", description: "Suggested resource category labels." },
    { field: "export_metadata.exported_for", type: "string", description: "Attorney email or firm entered at export time." },
    { field: "export_metadata.exported_at", type: "ISO 8601 date", description: "When the export was generated." },
    { field: "invention.brand_name", type: "string (optional)", description: "User-provided product or brand name, when available." },
    { field: "search_readiness", type: "object (optional)", description: "Inventor's own search-prep answers: key features, search terms, industries, sources searched, and references found." },
    { field: "disclosure_events", type: "array (optional)", description: "User-recorded sharing events: kind, approximate date, where, who, what, NDA status, and key-feature inclusion." },
    { field: "readiness_score_breakdown", type: "array (optional)", description: "Organization score components (core prep, materials, timeline and reference bonuses) — not legal merit." },
  ],
  csvFields: [
    "packet_id",
    "created_at",
    "readiness_score",
    "inventor_name",
    "inventor_email",
    "inventor_entity",
    "invention_title",
    "invention_summary",
    "problem_solved",
    "how_it_works",
    "key_components",
    "differences",
    "conception_date",
    "reduction_to_practice",
    "public_disclosures",
    "prior_art_notes",
    "suggested_search_terms",
    "cpc_suggestions",
    "prototype_status",
    "attachments",
    "gaps_and_questions",
    "recommended_resources",
    "exported_for",
    "exported_at",
    "inventorship_split",
    "invention_brand_name",
    "search_readiness",
    "disclosure_events",
    "readiness_score_breakdown",
  ],
  doesNotDo: [
    "Provide legal advice or create an attorney-client relationship",
    "Determine patentability, novelty, clearance, or infringement",
    "Recommend whether to file or how to claim an invention",
    "Replace patent agents, attorneys, clinics, or mentors",
    "Automatically send exports to law firms without inventor action",
    "Store or transmit highly confidential trade secrets securely",
  ],
  trustPoints: [
    "SmartProBonoIP is not a law firm",
    "Exports are generated client-side at the inventor's request",
    "Partner dashboard CSV excludes raw invention descriptions",
    "Public marketing analytics do not receive invention text, emails, or recovery tokens",
    "CPC suggestions and readiness scores are preparation aids only",
  ],
  pilotTeaser:
    "Now seeking Rhode Island pilot partners — innovation hubs, universities, clinics, IP professionals, and entrepreneur support organizations.",
} as const;

export const LEARN_COPY = {
  title: "Learn IP readiness basics",
  subtitle: "Patent-focused education for inventor preparedness",
  lead: "Interactive preparation before you build your invention disclosure packet or talk to an expert. Preparation only — not legal advice.",
  journeyTitle: "Start here before you build your packet",
  journeyLead:
    "SmartProBonoIP is an IP Readiness Platform. Phase 1 focuses on patent readiness: Learn → Disclose → Organize → Research → Review → Export → Connect.",
  journeySteps: [
    {
      phase: "Phase 1",
      label: "Learn",
      hint: "Privacy, inventorship, and patent prep topics.",
    },
    {
      phase: "Phase 2",
      label: "Disclose",
      hint: "Complete an invention-disclosure-style intake.",
    },
    {
      phase: "Phase 3",
      label: "Organize",
      hint: "Generate your IP Readiness Packet.",
    },
    {
      phase: "Phase 4+",
      label: "Research & handoff",
      hint: "Similar-reference prep, review, and professional export.",
    },
  ],
  modules: [
    {
      id: "ip-types",
      title: "Patents, trademarks, copyrights, and trade secrets",
      body: "These are different topics people may discuss with an expert. A patent often relates to how something works. A trademark may relate to names or brands. Copyright may relate to creative expression. Trade secrets may relate to information kept confidential. SmartProBonoIP does not tell you which applies to your idea — Phase 1 prepares you for patent conversations.",
      example:
        "Example: a reusable filter bottle might involve how it works (patent conversation), a product name (trademark conversation), and marketing photos (copyright conversation).",
      keyPoints: [
        "Different IP topics may apply to different parts of one idea.",
        "You do not need to decide which applies before talking to an expert.",
        "Other protection paths are coming soon on the platform chooser.",
      ],
      ctaLabel: "Start patent readiness packet →",
      ctaHref: "/disclaimer",
    },
    {
      id: "public-disclosure",
      title: "Privacy and public disclosure",
      body: "What you share — and when — can matter in later professional conversations. Public posts, pitches, demos, sales, and conference talks are common examples professionals may want to review. SmartProBonoIP helps you record sharing history; it does not decide legal consequences or deadlines.",
      example:
        "Example: posting a demo video six months ago is worth writing down so you can discuss timing with a professional.",
      keyPoints: [
        "Note when, where, who saw it, and what details were shown.",
        "Private conversations under confidentiality may differ from public sharing — record both.",
        "Keeping detailed invention information private until expert review is a common preparation practice.",
      ],
      ctaLabel: "Continue to sharing questions in intake →",
      ctaHref: "/disclaimer",
    },
    {
      id: "ai-inventorship",
      title: "AI tools and inventorship",
      body: "Generative AI may help write, sketch, or explore ideas — but inventorship questions are about human contribution. Note whether AI assisted your work and describe what humans decided, designed, or improved. This organizes facts for a registered patent practitioner; it does not decide inventorship.",
      example:
        "Example: ChatGPT drafted three mechanism options; you selected one, redesigned the seal, and built the prototype — capture both the AI help and your human contributions.",
      keyPoints: [
        "Describe what AI produced and what humans contributed.",
        "List people who helped invent separately from funders or manufacturers when you can.",
        "Offices have published AI-assisted invention guidance — ask a professional what it means for your facts.",
      ],
      ctaLabel: "Open inventorship notes in intake →",
      ctaHref: "/disclaimer",
    },
    {
      id: "inventorship-ownership",
      title: "Inventorship vs ownership",
      body: "Inventorship often refers to who contributed to the idea. Ownership often refers to who has rights to use or commercialize it — which may involve employers, schools, contracts, or collaborators. These are separate topics an expert may review with you.",
      example:
        "Example: you invented the concept, but a university lab tested it under a grant — both inventorship and ownership may need discussion.",
      keyPoints: [
        "Note who helped create, code, test, fund, or document the idea.",
        "Note whether written agreements exist — even if you are not sure.",
      ],
      ctaLabel: "Open ownership section in intake →",
      ctaHref: "/disclaimer",
    },
    {
      id: "idf-basics",
      title: "Invention disclosure form basics",
      body: "An invention disclosure (IDF-style) packet gathers what professionals often need: title, problem, how it works, preferred version, alternatives, similar work you know, sharing history, contributors, AI notes, and materials. Completing it prepares you for review — it is not a patent application.",
      example:
        "Example: a one-page preferred-version description plus three disclosure events and a prototype photo is stronger preparation than a long pitch deck alone.",
      keyPoints: [
        "Plain language is enough — perfection is not required.",
        "Preferred version and alternatives help professionals understand the design space.",
        "Your packet becomes a professional handoff brief, not a filing.",
      ],
      ctaLabel: "Start invention disclosure builder →",
      ctaHref: "/disclaimer",
    },
    {
      id: "similar-reference",
      title: "Similar-reference research (preparation only)",
      body: "Experts often explore what already exists in the field. You do not need to prove anything yourself. Saving search notes and gap observations helps you show up prepared — not to reach legal conclusions.",
      example:
        "Example: you find a similar portable filter and write what looks different — that becomes a conversation starter.",
      ctaLabel: "See sample research workspace →",
      ctaHref: "/sample#similar-reference-search-prep",
    },
    {
      id: "costs-timelines",
      title: "Costs, timelines, and what to expect",
      body: "Expert conversations, searches, and filings can take time and may involve fees. SmartProBonoIP does not quote costs or predict outcomes. Use your packet to organize questions about timeline, budget, and next steps.",
      example:
        "Example: ask a professional what documents they need first, what a search might involve, and what pro bono options may exist in your area.",
      keyPoints: [
        "Pro bono and clinic options may exist — availability varies.",
        "Maintenance fees and international filing are future topics.",
      ],
    },
    {
      id: "prototype",
      title: "Prototype and materials guidance",
      body: "Sketches, photos, prototypes, and test notes help experts understand your idea. You do not need a perfect prototype to start preparing. Note what you have and what you are still building.",
      example:
        "Example: a 3D-printed prototype photo plus a one-page test log is useful preparation even if the product is not finished.",
      ctaLabel: "Start packet — materials step →",
      ctaHref: "/disclaimer",
    },
    {
      id: "mistakes",
      title: "Common mistakes before expert review",
      body: "Waiting until everything is perfect, skipping ownership or AI-assistance notes, or sharing publicly without recording dates are common. Preparation helps you avoid starting from scratch at your first conversation.",
      example:
        "Example: spending weeks on a pitch deck but not writing down when you first built a prototype or posted a demo.",
    },
    {
      id: "when-professional",
      title: "When to talk to a professional",
      body: "You may want to talk to a patent agent, attorney, clinic, PTRC librarian, or mentor when you need expert review — not because this tool says you must. SmartProBonoIP organizes your story; humans provide legal judgment.",
      example:
        "Example: after organizing your packet, schedule a review to discuss similar references, ownership, disclosure timing, and next steps.",
      ctaLabel: "Build your packet first →",
      ctaHref: "/disclaimer",
    },
    {
      id: "tool-limits",
      title: "What SmartProBonoIP can and cannot do",
      body: "SmartProBonoIP organizes your idea into a readiness packet, suggests prep topics, and helps with similar-reference worksheets. It does not provide legal advice, determine protectability, inventorship, or replace experts.",
      example:
        "Example: the tool flags that public sharing may be worth discussing — it does not tell you what to file.",
      ctaLabel: "Visit Trust Center →",
      ctaHref: "/trust",
    },
  ],
  futureNote:
    "Trademark, copyright, trade-secret, and commercialization modules are registered on the platform architecture as coming-soon paths — not part of the current patent readiness workflow.",
} as const;

export const TRUST_COPY = {
  title: "Trust Center",
  subtitle: "How SmartProBonoIP works — and what it does not do",
  lead: "SmartProBonoIP helps inventors organize ideas before expert review. This page explains boundaries, data handling, and pilot practices.",
  doesDo: [
    "Organize invention details into a structured IP Readiness Packet",
    "Suggest preparation topics and expert questions — not legal answers",
    "Provide similar-reference search prep and gap-map worksheets",
    "Let you download PDF and structured exports when you choose",
    "Support pilot partners with aggregated, privacy-conscious metrics",
  ],
  doesNotDo: [
    "Provide legal advice or create an attorney-client relationship",
    "Determine patentability, novelty, clearance, infringement, or filing strategy",
    "Replace patent agents, attorneys, clinics, mentors, or PTRC librarians",
    "Automatically send your packet to third parties without your action",
    "Guarantee access to any specific program, attorney, or outcome",
  ],
  aiScope: {
    title: "AI usage and limitations",
    points: [
      "SmartProBonoIP uses optional OpenAI for packet generation and the Packet Coach when an API key is configured; otherwise rule-based prep responses are used",
      "When OpenAI is enabled, API submissions are not used to train OpenAI models by default under OpenAI's published API data policy; abuse-monitoring logs may be retained up to 30 days unless your deployment uses Zero Data Retention",
      "All AI-assisted outputs are editable drafts — not legal conclusions about patentability, inventorship, or disclosure duties",
      "Suggested CPC areas and search terms are conversation starters only",
      "Human expert review is still expected before any filing or legal decision",
    ],
  },
  whoCanSeeWhat: {
    title: "Who can see what",
    lead: "Plain-language facts about access to your packet. SmartProBonoIP does not decide whether use of this tool is or is not a public disclosure under patent law — that is a question for a licensed professional reviewing your facts.",
    points: [
      "There is no public directory, feed, or search index of inventor packets. Live packets are not published on the website.",
      "Your packet is reachable from the browser session that created it, or through a private recovery link you choose to create. Recovery links work like capability URLs — anyone who has the link can open that packet.",
      "Newly created recovery links are single-use: the first successful claim consumes the link. Links created before this change remain usable until they expire or you create a replacement of the same type. Creating a portfolio link does not revoke an existing packet link.",
      "Your workspace shows every invention created from the same browser session. There are no accounts yet, so clearing your browser data ends access from that device unless you saved a recovery link first.",
      "A portfolio recovery link restores every invention from that session, not just one packet. A single-packet link still restores only the packet it was made for. Treat portfolio links as the more sensitive of the two.",
      "Each invention keeps a short activity history — milestones such as when it was created, when a packet was generated, and when you generated an export. These entries record what happened and when, not your invention text.",
      "Your workspace also lists documents you generated (packet PDF, attorney export, intake summary). Those rows are labels and timestamps only; the files themselves download to your device and are not stored by SmartProBonoIP today.",
      "SmartProBonoIP is not a secure vault for trade secrets. The disclaimer gate asks you not to submit highly confidential details unless you understand the risks.",
      "When Supabase pilot mode is enabled, records are stored in our database. Anonymous direct database access is blocked by default; server-side operations use a restricted service role.",
      "Authorized pilot partners with the dashboard secret can view aggregated pilot metrics. Dashboard API responses exclude raw invention narratives (descriptions, notes, and search text). CSV exports also omit invention descriptions.",
      "First-party analytics and marketing tags do not receive invention text, packet content, emails, or recovery tokens.",
      "PDF and attorney exports download to your device only — nothing is sent automatically to a firm or third party.",
    ],
  },
  privacy: {
    title: "Privacy and data handling",
    points: [
      "Invention descriptions stay in your project until you export or share them yourself",
      "Recovery links use private tokens — treat them like passwords. New links work once",
      "Partner dashboard metrics and CSV exports omit raw invention descriptions",
      "Public marketing analytics do not receive emails, recovery tokens, or packet content",
      "Demo records are labeled and excluded from live pilot reporting and from your workspace",
      "Invention activity history stores milestone names and timestamps — not invention descriptions",
      "Document records store the title, type, format, and time of each export you generate — not a copy of the file",
      "Deletion requests are handled by email during the pilot — there is no automated self-serve delete button yet",
    ],
  },
  exportPrivacy: {
    title: "PDF and export privacy",
    points: [
      "PDF, JSON, CSV, and intake-summary exports download to your device — no automatic delivery to firms",
      "SmartProBonoIP does not keep a copy of generated files today; downloading again rebuilds them from your invention",
      "Export metadata records who you said the export was for (your entry only)",
      "You choose when to email or share files with a professional",
    ],
  },
  pilotAnalytics: {
    title: "Pilot analytics and partner tracking",
    points: [
      "Tracked pilot links help partners measure completions and clarity lift using source/campaign tags — not invention narratives",
      "Partner dashboard API responses and CSV exports omit raw invention descriptions",
      "Feedback forms collect support needs without replacing professional review",
    ],
  },
  contact: {
    title: "Contact and support",
    points: [
      "Questions about the tool: use the Contact page or pilot interest form",
      "Privacy requests: see Privacy summary and email bferrell@smartprobono.org",
      "Partnership pilots: request a conversation from the Pilot kit page",
    ],
  },
} as const;

export const AFTER_MEETING_COPY = {
  title: "After your expert meeting",
  subtitle: "Capture what you learned and update your packet",
  lead: "Use this page after a conversation with a patent professional, clinic, mentor, or partner. Preparation only — not legal advice.",
  meetingNotesTemplate: {
    title: "Meeting notes template",
    fields: [
      "Who did you meet with and on what date?",
      "What did they say they needed to review next?",
      "What documents did they ask you to gather?",
      "What questions came up that you could not answer yet?",
      "What follow-up timeline did they suggest, if any?",
      "What did you decide to do next (update packet, gather materials, schedule follow-up)?",
    ],
  },
  gatherNext: [
    "Updated sketches, photos, or prototype notes",
    "Signed or draft agreements with contributors",
    "Similar references they asked you to compare",
    "Timeline corrections or new milestone dates",
    "Written answers to questions raised in the meeting",
  ],
  followUpQuestions: [
    "What information do you still need from me?",
    "Should I gather additional similar references before our next conversation?",
    "Are there materials missing from my timeline or ownership notes?",
    "What would make the next review more useful for both of us?",
  ],
  updatePacket: [
    "Edit your IP Readiness Packet with new timeline dates",
    "Add saved references and gap-map notes from your research",
    "Refresh expert questions based on what you learned",
    "Re-download PDF or attorney export after updates",
  ],
  avoidWithoutAdvice: [
    "Publicly disclosing new technical details before discussing timing with your expert",
    "Assuming a casual conversation created legal representation",
    "Sharing recovery links or private packet tokens in public channels",
    "Treating readiness scores or CPC suggestions as filing instructions",
  ],
  bringToExpert: {
    title: "What to bring to your expert conversation",
    items: [
      "IP Readiness Packet PDF",
      "Sketches, photos, or prototype notes",
      "Development timeline",
      "Contributor and ownership notes",
      "Similar reference notes and gap map",
      "Questions you prepared in advance",
    ],
  },
  expertNextSteps: [
    {
      title: "Expert requested more documentation",
      body: "Update your packet timeline, materials checklist, and ownership notes. Re-export PDF when ready.",
    },
    {
      title: "Need prototype or drawings",
      body: "Gather photos, sketches, or test notes and add them to your materials section before follow-up.",
    },
    {
      title: "Need professional patentability search",
      body: "Save similar-reference notes from your workspace to discuss with an expert — not a DIY legal conclusion.",
    },
    {
      title: "Need trademark discussion",
      body: "Note brand names, logos, and public use history in your packet before the next conversation.",
    },
    {
      title: "Need provisional or filing discussion",
      body: "Write down what the expert said they need to review first. SmartProBonoIP does not recommend filing strategies.",
    },
    {
      title: "Need ownership or inventorship clarification",
      body: "Update contributor and agreement notes in your packet. Consider professional review of contracts.",
    },
    {
      title: "Need funding or commercialization support",
      body: "See future commercialization modules in Learn. Focus on organized packet handoff first.",
    },
  ],
} as const;

export const INTAKE_WHY_COPY: Record<
  number,
  { why: string; example: string; reminder?: string }
> = {
  0: {
    why: "Experts start with a plain-language summary. Writing this now saves you from reconstructing the story later.",
    example:
      "Example: “A bottle that filters water as you drink, for hikers who want lighter gear.”",
    reminder: "Preparation only — you do not need perfect legal wording.",
  },
  1: {
    why: "How it works and what makes it different are common first questions in expert review.",
    example:
      "Example: “A replaceable filter cartridge in the straw; lighter than carrying separate filters.”",
  },
  2: {
    why: "The shape of your idea (product, software, brand, etc.) helps suggest what topics your packet may touch.",
    example:
      "Example: checking “physical product” and “brand name” flags topics for discussion — not legal conclusions.",
  },
  3: {
    why: "Materials, sharing history, and contributors affect what an expert may ask about next.",
    example:
      "Example: noting a demo video on social media and a co-founder who helped code the app.",
    reminder: "Public sharing notes are for your records — not legal determinations.",
  },
  4: {
    why: "Your goals and location help suggest resource categories you may want to explore.",
    example:
      "Example: “Pro bono clinic near Providence” and “understand patent basics before hiring counsel.”",
  },
  5: {
    why: "Review catches gaps before your packet is generated — easier to fix now than after export.",
    example:
      "Example: noticing an empty “how it works” field and filling it in before generating.",
    reminder: "Preparation only — not legal advice.",
  },
  6: {
    why: "Your clarity rating helps measure whether the packet helped organize your thinking — not legal merit.",
    example:
      "Example: rating yourself 2 before and expecting to rate higher after reading the packet.",
  },
};

export const INTAKE_FIELD_WHY = {
  whatCreated: {
    why: "Experts need a plain-language description before discussing details.",
    example: "Example: “A portable water filter built into a reusable bottle.”",
  },
  problemSolved: {
    why: "The problem context helps experts understand why your approach may matter.",
    example: "Example: “Hikers want clean water without carrying separate filters.”",
  },
  whoFor: {
    why: "Audience and use case shape which topics an expert may discuss with you.",
    example: "Example: “Outdoor enthusiasts and emergency-preparedness customers.”",
  },
  howItWorks: {
    why: "Mechanism and workflow are core topics in many expert conversations.",
    example: "Example: “Water passes through a replaceable filter as you sip.”",
  },
  mainParts: {
    why: "Components help experts map your description to possible similar references.",
    example: "Example: “Filter cartridge, bottle body, cap with intake valve.”",
  },
  whatDifferent: {
    why: "Differences you observe are conversation starters — not legal conclusions.",
    example: "Example: “Combines bottle and filter in one unit for lighter carry weight.”",
  },
  itemType: {
    why: "Product type helps suggest which IP topics may be worth discussing.",
    example: "Example: physical product vs software vs brand-heavy idea.",
  },
  hasPrototype: {
    why: "Prototype status affects what materials an expert may ask you to bring.",
    example: "Example: photos of a working prototype vs concept sketches only.",
  },
  hasBrandIdentity: {
    why: "Names and brands may involve separate topics from how something works.",
    example: "Example: product name, logo, or slogan used in marketing.",
  },
  assets: {
    why: "Materials on hand speed up expert review and reduce back-and-forth.",
    example: "Example: sketches, photos, code repo, or test data.",
  },
  sharedChannels: {
    why: "Public sharing history may be relevant to timing — note what you shared, not legal outcomes.",
    example: "Example: demo video posted online or pitch at a public event.",
  },
  goals: {
    why: "Your goals help suggest resource categories — not specific legal actions.",
    example: "Example: pro bono clinic, patent agent consultation, or mentor review.",
  },
  location: {
    why: "Location may help partners suggest regional programs you can ask about.",
    example: "Example: city/state for clinic or pro bono program conversations.",
  },
} as const;

export const EXPORT_HANDOFF_COPY = {
  title: "Export and professional handoff",
  lead: "Download or share your invention disclosure packet when you are ready. Nothing is sent automatically. Preparation only — not legal advice.",
  bringTitle: "What to bring to your patent professional conversation",
  bringItems: [
    "IP Readiness Packet PDF (professional handoff brief)",
    "Invention title, preferred version, and alternatives notes",
    "Prototype, drawings, or photos",
    "Development timeline and disclosure events",
    "Contributor, ownership, and AI-assistance notes",
    "Similar references and gap-map notes",
    "Questions prepared in your packet",
    "Meeting notes from prior conversations",
  ],
  pdfLabel: "Download IP Readiness Packet",
  jsonLabel: "Export professional JSON",
  actions: [
    { label: "Download IP Readiness Packet", description: "Printable PDF handoff for your meeting" },
    { label: "Export professional JSON", description: "Structured JSON, CSV, and PDF for professionals" },
    { label: "View export schema", description: "Field reference for professionals", href: "/for-professionals" },
  ],
} as const;

export const CONNECT_V1_COPY = {
  title: "Connect — possible next resources",
  subtitle: "Starting points based on common inventor goals — not referrals or guarantees.",
  safety:
    "You may want to explore these resource categories with a partner or professional. SmartProBonoIP does not recommend a specific legal action or guarantee availability.",
  locationNote:
    "Location-aware routing is a future enhancement. v1.0 provides category guidance only.",
  categories: [
    {
      title: "Patent attorney",
      whenUseful: "When you may need formal legal review of patent-related questions.",
      note: "Preparation only — this is not a referral.",
    },
    {
      title: "Patent agent",
      whenUseful: "When you may need patent drafting or prosecution support from a registered agent.",
      note: "Consider asking about scope and fees in your first conversation.",
    },
    {
      title: "USPTO Patent Pro Bono",
      whenUseful: "When income eligibility may fit and you need pro bono patent assistance.",
      note: "Availability and eligibility vary by region.",
    },
    {
      title: "PTRC (Patent and Trademark Resource Center)",
      whenUseful: "When you want search help and general IP education at a library resource center.",
      note: "PTRCs provide education — not legal advice.",
    },
    {
      title: "University IP clinic",
      whenUseful: "When you are connected to a law school or university clinic program.",
      note: "Clinic capacity and scope vary.",
    },
    {
      title: "Innovation hub or accelerator",
      whenUseful: "When you need mentor routing, community programs, or founder support.",
      note: "May help with preparation before expert review.",
    },
    {
      title: "SCORE mentor",
      whenUseful: "When you need business mentoring alongside IP preparation.",
      note: "Business guidance — not legal advice.",
    },
    {
      title: "SBDC",
      whenUseful: "When you need local small-business planning and economic support resources.",
      note: "May complement IP preparation.",
    },
    {
      title: "Economic development organization",
      whenUseful: "When you need regional innovation or workforce development connections.",
      note: "Programs vary by location.",
    },
  ],
} as const;

export const PARTNER_DIRECTORY_COPY = {
  title: "Verified IP support partners",
  subtitle:
    "External destinations checked for identity and information — not endorsements or referrals.",
  lead:
    "Browse verified partners that may help with IP preparation next steps. SmartProBonoIP does not send your invention details automatically. Availability and eligibility vary by partner.",
  verificationNote:
    "Verified means we checked the official destination and partner information — not an endorsement of legal quality or outcomes.",
  boundaryNote:
    "SmartProBonoIP helps you prepare organized materials. Partners provide their own services under their policies. Nothing here is legal advice from SmartProBonoIP.",
  searchLabel: "Search partners",
  searchPlaceholder: "Search by name, location, or service…",
  emptyResults: "No partners match your filters. Try clearing a filter or browsing all verified partners.",
  prepareBeforeContact: "Prepare before contacting",
  prepareBeforeContactNote:
    "You may want to organize your idea and timeline before reaching out — SmartProBonoIP can help you prepare materials to share if you choose.",
  externalLinkConfirm:
    "I understand I am leaving SmartProBonoIP to visit an external resource. No invention details will be sent automatically.",
  sharedInfoNote:
    "SmartProBonoIP does not automatically send your invention details, intake answers, or contact information to external partners.",
  backToDirectory: "Back to partner directory",
  officialDestination: "Official destination",
  lastVerified: "Last verified",
  eligibility: "Eligibility",
  jurisdictions: "Geography & jurisdiction",
  audiences: "Who they may help",
  services: "What they may help with",
  doesNotDo: "What they do not do",
  whyMayHelp: "Why this may help",
  availability: "Availability",
  browseCta: "Browse verified IP support partners",
} as const;

export const COMMERCIALIZATION_COPY = {
  title: "Commercialization topics (future modules)",
  lead: "These topics are intentionally deferred from the v1.0 readiness workflow. They may become future Learn modules after expert handoff.",
  topics: [
    { title: "Licensing", body: "Exploring how rights might be shared with partners — requires professional review." },
    { title: "Manufacturing", body: "Scaling production and supply chain — business planning, not legal advice here." },
    { title: "Investors", body: "Fundraising conversations often follow IP and ownership clarity." },
    { title: "Maintenance fees", body: "Ongoing costs after filing — discuss with a professional." },
    { title: "International filing", body: "Country-by-country strategy — expert review required." },
    { title: "Technology transfer", body: "University or lab commercialization paths — institution-specific." },
  ],
  statusNote:
    "Complete for v1.0: future expansion documented. Not part of current packet builder workflow.",
} as const;

export const INSTITUTIONAL_WORKFLOW_COPY = {
  title: "Institutional pilot workflow",
  lead: "How clinics, universities, innovation hubs, and professionals use SmartProBonoIP in v1.0 pilots.",
  steps: [
    {
      title: "Share tracked pilot link",
      body: "Partners distribute QR or URL links so completions can be measured without exposing invention text in analytics.",
    },
    {
      title: "Inventor builds readiness packet",
      body: "Guided intake, timeline, materials, similar-reference prep, and expert questions — preparation only.",
    },
    {
      title: "Receive PDF or JSON handoff",
      body: "Review organized summaries before the first live conversation. Request missing info using packet gaps.",
    },
    {
      title: "Track pilot outcomes",
      body: "Dashboard shows completions, clarity lift, PDF downloads, recovery usage, feedback, and partner filters (demo mode labeled).",
    },
  ],
  audiences: [
    "Patent agents and IP attorneys",
    "Law clinics and pro bono programs",
    "Universities and innovation hubs",
    "Economic development partners",
  ],
} as const;

export const FOR_CLINICS_COPY = {
  title: "For IP Clinics & Pro Bono Programs",
  subtitle: "Cleaner referrals before clinic review",
  lead: "SmartProBonoIP helps inventors arrive with organized summaries, timelines, ownership notes, similar-reference prep, and questions — reducing repetitive intake work for clinic staff.",
  problems: [
    "Incomplete intake stories that require multiple back-and-forth emails",
    "Missing timeline, sharing, or ownership context",
    "Unstructured similar-reference notes",
  ],
  receives: [
    "Plain-language idea summary and readiness snapshot",
    "Development timeline and materials checklist",
    "Ownership/contributor prep notes",
    "Similar-reference worksheets and expert questions",
    "PDF or JSON export for clinic review",
  ],
  pilotSteps: [
    "Distribute tracked clinic link",
    "Review completed packets in dashboard or via export",
    "Request missing info using packet gap sections",
    "Measure clarity lift and completion metrics",
  ],
  doesNotDo:
    "Not legal advice. Not eligibility determinations. Does not replace clinic judgment or create attorney-client relationships.",
} as const;

export const FOR_UNIVERSITIES_COPY = {
  title: "For Universities & Innovation Hubs",
  subtitle: "Prepare founders before PTRC, clinic, or mentor referrals",
  lead: "Help student inventors and founders organize ideas before they meet PTRC librarians, clinics, mentors, or external IP professionals.",
  problems: [
    "Founders arrive with unstructured pitch decks but no timeline or materials list",
    "Ownership questions involving labs, grants, or co-founders are unclear",
    "Similar-reference prep is skipped before first expert conversation",
  ],
  receives: [
    "Structured IP Readiness Packet with readiness score",
    "Research workspace with outbound search tools (preparation only)",
    "Resource routing categories for next steps",
    "Pilot metrics for partner reporting",
  ],
  pilotSteps: [
    "Embed pilot link in incubator or course materials",
    "Use sample packet for workshops",
    "Review dashboard metrics for program impact",
    "Hand off PDF/JSON to mentors or external counsel when ready",
  ],
  doesNotDo:
    "Not a replacement for technology transfer office review, legal counsel, or formal filing decisions.",
} as const;

export const INTAKE_STEP_LEARN_LINKS: Record<
  number,
  { label: string; href: string }
> = {
  0: { label: "Learn: IP basics before you start", href: "/learn" },
  1: { label: "Learn: how similar-reference prep helps", href: "/learn" },
  2: { label: "Learn: patents vs trademarks vs copyright", href: "/learn" },
  3: { label: "Learn: public sharing & ownership", href: "/learn" },
  4: { label: "Learn: when to talk to a professional", href: "/learn" },
  5: { label: "Review your answers before generating", href: "/learn" },
  6: { label: "Trust Center: what this tool does not do", href: "/trust" },
};
