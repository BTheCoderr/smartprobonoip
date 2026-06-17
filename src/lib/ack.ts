const ACK_KEY = "smartprobonoip:disclaimer-ack";

export function acknowledgeDisclaimer(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACK_KEY, "true");
}

export function hasAcknowledgedDisclaimer(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ACK_KEY) === "true";
}
