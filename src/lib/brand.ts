/** Logo palette — single source of truth for brand colors */
export const BRAND_COLORS = {
  deepNavy: "#022E55",
  midnightNavy: "#03133B",
  primaryTeal: "#049397",
  darkTeal: "#037681",
  softAqua: "#5DAAB0",
  offWhite: "#FDFDFD",
} as const;

export const LEGAL = {
  copyrightHolder: "SmartProBono",
  copyrightYear: 2026,
  productName: "SmartProBonoIP",
  privacyEmail: "privacy@smartprobonoip.org",
  pdfWatermark:
    "Confidential — Prepared with SmartProBonoIP — For discussion only",
} as const;

/** Increment when packet PDF structure or sections change materially. */
export const PACKET_PDF_VERSION = "1.3";

export function formatCopyrightNotice() {
  return `© ${LEGAL.copyrightYear} ${LEGAL.copyrightHolder}. All rights reserved.`;
}

export const BRAND = {
  umbrella: "SmartProBono",
  product: "SmartProBonoIP",
  feature: "IP Readiness Checker",
  tagline:
    "Turn a messy invention idea into an organized IP Readiness Packet",
  positioning:
    "SmartProBonoIP helps inventors, founders, clinics, and innovation programs prepare clearer invention summaries, development timelines, similar-reference notes, and questions before expert review.",
  coreMessage:
    "A good idea should not die just because the first step is confusing.",
  mission:
    "Built for people who may have strong ideas but limited access to the IP system. SmartProBonoIP is not replacing experts — it helps more people become ready enough to reach them.",
} as const;
