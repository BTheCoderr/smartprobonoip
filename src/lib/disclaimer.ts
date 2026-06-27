export const DISCLAIMER = [
  "SmartProBonoIP is an educational readiness and organization tool. It does not provide legal advice and is not a substitute for a licensed patent agent, patent attorney, or other qualified professional.",
  "Nothing here is a legal opinion or conclusion about whether your idea can be protected. Using SmartProBonoIP does not create an attorney-client relationship.",
  "The signals and suggestions below are starting points to help you prepare for a conversation with an expert. Always confirm next steps with a qualified professional, especially before any public disclosure or filing decision.",
].join("\n\n");

export const PRIVACY_NOTICE = [
  "What we collect: your intake answers, optional clarity ratings (before and after), generated readiness profiles, optional pilot feedback, saved research prep notes you choose to store, and first-party analytics events (event names, routes, signal keys, and safe counts — not your full invention text).",
  "Google Analytics (GA4): when enabled, we use GA4 on public pages to measure visitor traffic and campaign attribution (UTM parameters, referrer, landing page). GA4 receives page paths and safe event names only — not your invention descriptions, saved research notes, emails, recovery tokens, or private packet content.",
  "Where it is stored: on your device (local mode) or in our database when Supabase is configured for a pilot. Demo data is clearly marked and excluded from live pilot reporting.",
  "Partner pilot reporting: authorized partners with a dashboard secret may view aggregated pilot metrics and export CSV summaries for readiness reporting. CSV exports exclude raw invention descriptions and free-text feedback notes.",
  "Recovery links: if you create a recovery link, we store only a hashed token (never the raw link text). Anyone with the private link can access your packet until the link expires or you create a new one.",
  "What we do not do: we do not provide legal advice, confidential legal representation, or an attorney-client relationship. SmartProBonoIP is not a secure vault for trade secrets. Do not submit details you are not comfortable sharing unless you understand the risks.",
  "Deletion and export: you may email us to request export or deletion of your pilot data during the pilot period.",
].join("\n\n");

export const CONSENT_EDUCATIONAL =
  "I understand that SmartProBonoIP is an educational readiness tool and does not provide legal advice.";

export const CONSENT_CONFIDENTIAL =
  "I understand SmartProBonoIP does not provide legal advice and I should not submit highly confidential details unless I understand the risks.";

export const DISCLAIMER_SHORT =
  "Educational readiness tool only. Not legal advice and not a substitute for a qualified professional.";
