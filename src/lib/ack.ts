const ACK_KEY = "smartprobonoip:disclaimer-ack";
const CONSENT_KEY = "smartprobonoip:consent-at";

export function acknowledgeDisclaimer(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACK_KEY, "true");
  window.sessionStorage.setItem(CONSENT_KEY, new Date().toISOString());
}

export function hasAcknowledgedDisclaimer(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ACK_KEY) === "true";
}

export function getConsentTimestamp(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(CONSENT_KEY);
}

export function clearAcknowledgement(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACK_KEY);
  window.sessionStorage.removeItem(CONSENT_KEY);
}
