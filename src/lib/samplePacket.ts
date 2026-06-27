import { DEMO_INVENTION } from "./demo";
import { generateProfile } from "./generateProfile";
import type { ProjectRecord } from "./types";

/** Static sample packet for partner demos — HydroSeal fictional invention. */
export const SAMPLE_PACKET_ID = "sample-packet";

export const SAMPLE_RECORD: ProjectRecord = {
  id: SAMPLE_PACKET_ID,
  createdAt: "2026-06-01T12:00:00.000Z",
  answers: DEMO_INVENTION,
  profile: generateProfile(DEMO_INVENTION),
  preClarity: 2,
  postClarity: 4,
  isDemo: true,
  followUpStatus: { day30: "pending", day60: "pending", day90: "pending" },
};
