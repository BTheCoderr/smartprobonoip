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
  platformName: "SmartProBono",
  productName: "SmartProBonoIP",
  privacyEmail: "bferrell@smartprobono.org",
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
  platformFeature: "Legal + IP Preparation",
  platformTagline: "Prepare before the next legal or IP conversation.",
  platformPositioning:
    "SmartProBono helps people understand what they have, organize the facts, prepare useful documents and questions, and connect with the right next step — without pretending to replace a lawyer or other qualified professional.",
  product: "SmartProBonoIP",
  feature: "IP Readiness Platform",
  tagline: "What are you trying to protect?",
  positioning:
    "SmartProBonoIP is an IP Readiness Platform that helps inventors prepare clearer invention disclosures, sharing timelines, and professional handoff packets before expert review — starting with patents.",
  coreMessage:
    "A good idea should not die just because the first step is confusing.",
  mission:
    "Built for people who may have strong ideas but limited access to the legal and IP systems. SmartProBono helps people become better prepared for the professionals and institutions they may need.",
} as const;
