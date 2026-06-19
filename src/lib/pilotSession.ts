const SESSION_KEY = "smartprobonoip:pilot-session";
const PARTNER_SECRET_KEY = "smartprobonoip:partner-secret";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getPilotSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = newId();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getPartnerSecret(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(PARTNER_SECRET_KEY);
}

export function setPartnerSecret(secret: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PARTNER_SECRET_KEY, secret);
}

export function pilotSessionHeaders(): HeadersInit {
  return { "x-pilot-session": getPilotSessionId() };
}

export function partnerSecretHeaders(secret?: string | null): HeadersInit {
  const value = secret ?? getPartnerSecret();
  return value ? { "x-partner-secret": value } : {};
}
