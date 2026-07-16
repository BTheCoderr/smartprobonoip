import { LEGAL } from "./brand";

export const DISCLAIMER = [
  "SmartProBonoIP is an educational readiness and organization tool. It does not provide legal advice and is not a substitute for a licensed patent agent, patent attorney, or other qualified professional.",
  "Nothing here is a legal opinion or conclusion about whether your idea can be protected. Using SmartProBonoIP does not create an attorney-client relationship.",
  "The signals and suggestions below are starting points to help you prepare for a conversation with an expert. Always confirm next steps with a qualified professional, especially before any public disclosure or filing decision.",
].join("\n\n");

export const PRIVACY_NOTICE = [
  "What we collect: your intake answers, optional clarity ratings (before and after), generated readiness profiles, optional pilot feedback, saved research prep notes you choose to store, and first-party analytics events (event names, routes, signal keys, and safe counts — not your full invention text).",
  "Google Tag Manager (GTM): when enabled, we load GTM on public marketing pages only to measure visitor traffic and campaign attribution (UTM parameters, referrer, landing page). GA4 measurement (configured inside GTM) receives public page paths and safe event names only — not your invention descriptions, saved research notes, emails, recovery tokens, or private packet content. Private app activity stays in our internal Supabase analytics.",
  "Where it is stored: on your device (local mode) or in our database when Supabase is configured for a pilot. Demo data is clearly marked and excluded from live pilot reporting.",
  "Partner pilot reporting: authorized partners with a dashboard secret may view aggregated pilot metrics and export CSV summaries for readiness reporting. CSV exports exclude raw invention descriptions and free-text feedback notes.",
  "Recovery links: if you create a recovery link, we store only a hashed token (never the raw link text). Anyone with the private link can access your packet until the link expires or you create a new one.",
  "What we do not do: we do not provide legal advice, confidential legal representation, or an attorney-client relationship. SmartProBonoIP is not a secure vault for trade secrets. Do not submit details you are not comfortable sharing unless you understand the risks.",
  "Deletion and export: you may email us to request export or deletion of your pilot data during the pilot period.",
  "Data retention: during the pilot, we keep records only as long as needed to measure readiness impact, support recovery links you create, and improve the product. When you request deletion, we remove or anonymize your pilot data within a reasonable timeframe unless we must retain a minimal record for security or legal compliance.",
  "Subprocessors: we use Netlify for website hosting and deployment, Supabase for database storage when cloud mode is enabled, and optionally Google Tag Manager / Google Analytics 4 on public marketing pages only. These providers process data according to their own terms and only as needed to operate the service.",
  `Security incidents: if you believe your data has been accessed without authorization, contact ${LEGAL.privacyEmail}. We will review reported concerns and respond within a reasonable timeframe.`,
].join("\n\n");

export const TERMS_OF_SERVICE = [
  "Acceptance: by accessing or using SmartProBonoIP, you agree to these Terms of Service. If you do not agree, do not use the platform.",
  "What SmartProBonoIP is: SmartProBonoIP is an educational readiness and organization tool. It helps you prepare clearer invention summaries, timelines, similar-reference notes, and questions before expert review. It does not provide legal advice and does not create an attorney-client relationship.",
  "License to use: SmartProBono grants you a limited, revocable, non-exclusive, non-transferable license to use SmartProBonoIP for personal or authorized pilot purposes. We may change, suspend, or discontinue features at any time.",
  "Your content: you retain ownership of the invention descriptions, notes, and other content you submit. You grant SmartProBono a limited license to store, process, and display that content only as needed to operate the service (for example, generating your readiness packet, saving research prep, or honoring a recovery link you create).",
  "Our intellectual property: SmartProBono owns the SmartProBonoIP platform, including its software, design, branding, workflows, and documentation. These Terms do not grant you any ownership in the platform itself.",
  "Prohibited uses: you may not scrape, crawl, bulk-extract, or systematically copy platform content or user workflows; reverse engineer, decompile, or attempt to derive source code from the service; build a derivative or competing service based on SmartProBonoIP's workflow or materials; interfere with security or abuse rate limits; or use the platform for unlawful purposes.",
  "Access and termination: we may suspend or revoke access if we reasonably believe you violated these Terms, abused the service, or created security or legal risk. You may stop using the platform at any time.",
  "Disclaimers: SmartProBonoIP is provided for educational preparation only. See our Disclaimer and Trust Center for full limits on what the tool does and does not do.",
  "Privacy: our Privacy page describes what we collect, how long we keep it, and who processes it on our behalf.",
  "Changes: we may update these Terms from time to time. Continued use after changes are posted means you accept the updated Terms.",
  `Contact: questions about these Terms may be sent to ${LEGAL.privacyEmail}.`,
].join("\n\n");

export const CONSENT_EDUCATIONAL =
  "I understand that SmartProBonoIP is an educational readiness tool and does not provide legal advice.";

export const CONSENT_CONFIDENTIAL =
  "I understand SmartProBonoIP does not provide legal advice and I should not submit highly confidential details unless I understand the risks.";

export const DISCLAIMER_SHORT =
  "Educational readiness tool only. Not legal advice and not a substitute for a qualified professional.";

export const ATTORNEY_EXPORT_NOTICE =
  "This structured export is for preparation and organization only. It does not provide legal advice, patentability opinions, clearance opinions, or filing recommendations. CPC suggestions and readiness scores are starting points for expert conversation only.";

export function buildAttorneyExportDisclaimer() {
  return {
    paragraphs: DISCLAIMER.split("\n\n"),
    short: DISCLAIMER_SHORT,
    attorney_export_notice: ATTORNEY_EXPORT_NOTICE,
  };
}
