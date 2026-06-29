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
    "Start with Google Patents, USPTO Patent Public Search, or The Lens — then save what you find as possible similar references.",
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
  heroStamp: "IP READINESS",
  heroSafety: "Preparation only — not legal advice.",
  ctaPrimary: "Start your free readiness packet",
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
      title: "Packet Builder",
      body: "Guided intake turns scattered notes into structured packet sections.",
      previewLines: [
        "Step 3 · How it works",
        "Describe the main parts in plain language…",
        "✓ Idea basics complete",
      ],
    },
    {
      title: "Readiness snapshot",
      body: "See what is organized and what may still need attention before expert review.",
      previewLines: [
        "Readiness snapshot",
        "Core intake · 6 of 7 complete",
        "Materials · 2 optional gaps",
      ],
    },
    {
      title: "Development timeline",
      body: "Capture when you conceived, built, and tested — preparation only.",
      previewLines: [
        "Mar 2024 · First sketch",
        "Jun 2024 · Working prototype",
        "Jan 2025 · Field testing",
      ],
    },
    {
      title: "Similar Reference Search + Gap Map",
      body: "Grouped queries, outbound tools (Google Patents, USPTO, WIPO, and more), and gap maps for expert conversation — not patentability opinions.",
      previewLines: [
        "Starter query · portable water filter bottle",
        "CPC areas to discuss · B01D · A45F",
        "Gap note · What looks different?",
      ],
    },
    {
      title: "PDF export",
      body: "Download a handoff packet to share with a clinic, mentor, or IP professional.",
      previewLines: [
        "IP Readiness Packet · PDF",
        "Idea summary · Timeline · Questions",
        "Preparation only — not legal advice",
      ],
    },
    {
      title: "Expert handoff summary",
      body: "Plain-language overview and questions organized for the next conversation.",
      previewLines: [
        "Idea at a glance",
        "Questions to bring with you",
        "Suggested resource categories",
      ],
    },
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
