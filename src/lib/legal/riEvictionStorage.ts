import type { RiEvictionIntake } from "@/lib/legal/riEvictionTypes";

export const RI_EVICTION_SESSION_KEY = "spb:legal:ri-eviction:v2";

export const EMPTY_RI_EVICTION_INTAKE: RiEvictionIntake = {
  city: "",
  zip: "",
  noticeReceived: "unsure",
  noticeType: "Other / unsure",
  noticeDate: "",
  caseFiled: "unsure",
  courtDate: "",
  judgmentEntered: "unsure",
  behindOnRent: "unsure",
  arrearsAmount: "",
  appliedForAssistance: "unsure",
  subsidy: "unsure",
  unsafeConditions: "unsure",
  conditionsNotes: "",
  retaliationConcern: "unsure",
  discriminationConcern: "unsure",
  disabilityAccommodation: "unsure",
  needsInterpreter: "unsure",
  goals: [],
  otherGoal: "",
  situationNotes: "",
  understandsPreparationOnly: false,
};

export function readRiEvictionIntake(): RiEvictionIntake | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(RI_EVICTION_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RiEvictionIntake>;
    return { ...EMPTY_RI_EVICTION_INTAKE, ...parsed };
  } catch {
    return null;
  }
}

export function saveRiEvictionIntake(intake: RiEvictionIntake): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(RI_EVICTION_SESSION_KEY, JSON.stringify(intake));
}

export function clearRiEvictionIntake(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(RI_EVICTION_SESSION_KEY);
}

export function riEvictionSnapshot(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(RI_EVICTION_SESSION_KEY) || "";
}

export function subscribeRiEvictionStorage(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: StorageEvent) => {
    if (event.key === RI_EVICTION_SESSION_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
