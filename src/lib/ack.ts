import {
  createIntakeConsent,
  parseIntakeConsent,
  type IntakeConsent,
} from "./consent";

const ACK_KEY = "smartprobonoip:disclaimer-ack";
const CONSENT_RECORD_KEY = "smartprobonoip:intake-consent";

function readStoredConsent(): IntakeConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_RECORD_KEY);
    return raw ? parseIntakeConsent(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Records both checkbox acknowledgements with the current copy version. */
export function acknowledgeDisclaimer(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACK_KEY, "true");
  window.localStorage.setItem(
    CONSENT_RECORD_KEY,
    JSON.stringify(createIntakeConsent()),
  );
}

/**
 * True only when a consent record for the current disclaimer version exists.
 * Older "true"-only acknowledgements are asked to accept again once.
 */
export function hasAcknowledgedDisclaimer(): boolean {
  return readStoredConsent() !== null;
}

/** Sent with packet creation so the server can persist what was accepted. */
export function getIntakeConsent(): IntakeConsent | null {
  return readStoredConsent();
}

export function getConsentTimestamp(): string | null {
  return readStoredConsent()?.consentedAt ?? null;
}

export function clearAcknowledgement(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACK_KEY);
  window.localStorage.removeItem(CONSENT_RECORD_KEY);
}
