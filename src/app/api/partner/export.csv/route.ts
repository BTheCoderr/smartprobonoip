import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics/server";
import { listLiveRecords, verifyPartnerSecret } from "@/lib/db/records";
import { getFeedbackMapByProjectIds } from "@/lib/db/feedback";
import { getProjectEventFlags } from "@/lib/db/analytics";
import { ownershipCsvFields } from "@/lib/ownership";
import { SUPPORT_NEED_OPTIONS } from "@/lib/feedback";
import { SIGNAL_LABELS, RESOURCE_LABELS } from "@/lib/labels";
import { isSupabaseServerConfigured } from "@/lib/supabaseServer";

function readSecret(request: Request): string | null {
  return (
    request.headers.get("x-partner-secret") ??
    new URL(request.url).searchParams.get("secret")
  );
}

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  if (!verifyPartnerSecret(readSecret(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await listLiveRecords();
  const eventFlags = await getProjectEventFlags(records.map((r) => r.id));
  const header = [
    "id",
    "created_at",
    "item_type",
    "partner_slug",
    "partner_name",
    "source",
    "campaign",
    "signals",
    "public_disclosure",
    "pre_clarity",
    "post_clarity",
    "clarity_delta",
    "recommended_resources",
    "followup_30",
    "followup_60",
    "followup_90",
    "is_demo",
    "pdf_downloaded",
    "recovery_link_created",
    "feedback_submitted",
    "clarity_helped",
    "would_bring_to_expert",
    "support_needed",
    "follow_up_requested",
    "ownership_signal",
    "contributors_involved",
    "contributor_types",
    "agreement_status",
    "agreement_types",
    "employer_school_grant_flag",
  ];

  const feedbackMap = await getFeedbackMapByProjectIds(records.map((r) => r.id));

  const rows = records.map((r) => {
    const delta =
      typeof r.postClarity === "number" ? r.postClarity - r.preClarity : "";
    const flags = eventFlags.get(r.id);
    const feedback = feedbackMap.get(r.id);
    const ownership = ownershipCsvFields(r);
    const supportLabels = feedback?.supportNeeded
      .map(
        (need) =>
          SUPPORT_NEED_OPTIONS.find((option) => option.value === need)?.label ??
          need,
      )
      .join("; ");
    return [
      r.id,
      r.createdAt,
      r.answers.itemType,
      r.partnerSlug ?? "",
      r.partnerName ?? "",
      r.source ?? "",
      r.campaign ?? "",
      r.profile.signals.map((s) => SIGNAL_LABELS[s]).join("; "),
      r.profile.publicDisclosure,
      r.preClarity,
      r.postClarity ?? "",
      delta,
      r.profile.recommendedResources.map((x) => RESOURCE_LABELS[x]).join("; "),
      r.followUpStatus?.day30 ?? "pending",
      r.followUpStatus?.day60 ?? "pending",
      r.followUpStatus?.day90 ?? "pending",
      r.isDemo ?? false,
      flags?.pdfDownloaded ?? false,
      flags?.recoveryCreated ?? false,
      Boolean(feedback),
      feedback?.clarityHelped ?? "",
      feedback?.wouldBringToExpert ?? "",
      supportLabels ?? "",
      feedback?.followUpRequested ?? false,
      ownership.ownership_signal,
      ownership.contributors_involved,
      ownership.contributor_types,
      ownership.agreement_status,
      ownership.agreement_types,
      ownership.employer_school_grant_flag,
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  await trackServerEvent("csv_exported", {
    metadata: { eventCount: records.length },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="smartprobonoip-pilot-export.csv"',
    },
  });
}
