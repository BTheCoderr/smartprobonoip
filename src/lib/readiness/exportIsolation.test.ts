import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  buildAttorneyExportPacket,
  computePacketOrganizationScore,
  PACKET_ORGANIZATION_SCORE_TYPE,
} from "@/lib/attorneyExport";
import { DEMO_INVENTION } from "@/lib/demo";
import { generateProfile } from "@/lib/generateProfile";
import { computeOverallReadinessScore } from "@/lib/readiness";
import type { ProjectRecord } from "@/lib/types";

function fixture(): ProjectRecord {
  return {
    id: "org-score-fixture",
    createdAt: "2026-06-01T12:00:00.000Z",
    answers: DEMO_INVENTION,
    profile: generateProfile(DEMO_INVENTION),
    preClarity: DEMO_INVENTION.preClarity,
    postClarity: null,
    isDemo: false,
    developmentTimeline: {
      "Date idea started": "2025-01",
      "Date first prototype built": "2025-06",
      "Date first shared publicly": "2026-03",
    },
  };
}

const INVENTOR_UI_ROOTS = [
  "src/components/dashboard",
  "src/components/portfolio",
  "src/components/profile",
  "src/components/timeline",
  "src/app/workspace",
  "src/app/profile",
];

function walkTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkTsFiles(full));
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("attorney export organization score isolation", () => {
  it("keeps Formula B separate from the canonical Formula A score", () => {
    const record = fixture();
    const canonical = computeOverallReadinessScore(record, 0);
    const organization = computePacketOrganizationScore(record, 0);
    const packet = buildAttorneyExportPacket(record, [], "Clinic reviewer");

    assert.notEqual(canonical, organization);
    assert.equal(packet.readiness_score, organization);
    assert.equal(packet.readiness_score_type, PACKET_ORGANIZATION_SCORE_TYPE);
  });

  it("does not import Formula B into inventor-facing UI modules", () => {
    const forbidden = [
      "computePacketOrganizationScore",
      "computePacketOrganizationScoreBreakdown",
      "computeReadinessScoreBreakdown",
      'from "@/lib/attorneyExport"',
      "from '@/lib/attorneyExport'",
    ];
    // AttorneyExportModal may import attorneyExport for export UX — exclude it.
    const allowList = new Set([
      join("src/components/profile/AttorneyExportModal.tsx"),
    ]);

    const offenders: string[] = [];
    for (const root of INVENTOR_UI_ROOTS) {
      for (const file of walkTsFiles(root)) {
        if (allowList.has(file)) continue;
        const text = readFileSync(file, "utf8");
        for (const needle of forbidden) {
          if (text.includes(needle)) {
            offenders.push(`${file} :: ${needle}`);
          }
        }
      }
    }

    assert.deepEqual(offenders, []);
  });
});
