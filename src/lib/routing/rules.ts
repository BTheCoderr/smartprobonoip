import {
  intakeStepTarget,
  profileAnchorTarget,
  PROFILE_ANCHORS,
  researchTarget,
} from "@/lib/readiness/links";
import { ROUTES } from "@/lib/routes";
import { formatWhyRecommended } from "./reasons";
import {
  getPartner,
  isPartnerPersonalizable,
  PARTNER_REGISTRY,
} from "./registry";
import type { BuiltRoutingRecommendation, RoutingContext, RoutingRule } from "./types";

const LEAD_IN = "Based on the information you organized,";
const USEFUL = "A useful next step may be";

type BuiltRecommendation = BuiltRoutingRecommendation;

function partnerRec(
  partnerId: string,
  ctx: RoutingContext,
  overrides: {
    id: string;
    category: RoutingRule["category"];
    priority: RoutingRule["priority"];
    title: string;
    body: string;
    reasons: import("./types").RecommendationReason[];
    isUrgent?: boolean;
  },
): BuiltRecommendation | null {
  const partner = getPartner(partnerId);
  if (!partner || !isPartnerPersonalizable(partner)) {
    return null;
  }
  const href = partner.buildDestination({
    projectId: ctx.projectId,
    utmCampaign: overrides.id,
  });
  return {
    id: overrides.id,
    category: overrides.category,
    priority: overrides.priority,
    title: overrides.title,
    body: overrides.body,
    reasons: overrides.reasons,
    partnerId,
    isUrgent: overrides.isUrgent ?? false,
    action: {
      kind: partner.orgType === "internal_platform" ? "internal_link" : "external_link",
      href,
      label: `Explore ${partner.name}`,
    } as const,
  };
}

export const ROUTING_RULES: RoutingRule[] = [
  {
    id: "urgent-deadline",
    category: "urgent_timing_deadline",
    priority: 1,
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    jurisdictions: ["United States"],
    handoffMode: "internal_page",
    when: (ctx) =>
      ctx.hasConcreteUrgentDeadline ||
      ctx.hasPlannedPublicDisclosure ||
      ctx.hasOfficeActionResponseNeed,
    build: (ctx) => ({
      id: "urgent-deadline",
      category: "urgent_timing_deadline",
      priority: 1,
      title: "Review time-sensitive timing notes",
      body: `${LEAD_IN} you noted dates or plans that may be worth discussing soon with a qualified professional. SmartProBonoIP does not calculate legal deadlines.`,
      reasons: ctx.hasOfficeActionResponseNeed
        ? ["office_action_response"]
        : ctx.hasPlannedPublicDisclosure
          ? ["planned_public_disclosure"]
          : ["urgent_deadline"],
      isUrgent: true,
      action: {
        kind: "profile_anchor",
        href: profileAnchorTarget(
          ctx.projectId,
          PROFILE_ANCHORS.developmentTimeline,
          "Review timeline",
        ).href,
        label: "Review timeline notes",
      },
    }),
  },
  {
    id: "review-public-disclosure-no-date",
    category: "review_public_disclosure",
    priority: 1,
    when: (ctx) => ctx.hasPastDisclosureWithoutReliableDate,
    build: (ctx) => ({
      id: "review-public-disclosure-no-date",
      category: "review_public_disclosure",
      priority: 1,
      title: "Review public-disclosure concerns",
      body: `${LEAD_IN} you mentioned sharing but not a reliable date. ${USEFUL} speaking with a patent professional or clinic about what you shared and when — SmartProBonoIP does not calculate legal consequences.`,
      reasons: ["public_disclosure_past_no_date"],
      action: {
        kind: "intake_step",
        href: intakeStepTarget(
          ctx.projectId,
          "timeline",
          "Add disclosure details",
        ).href,
        label: "Add disclosure details",
      },
    }),
  },
  {
    id: "continue-preparing-core",
    category: "continue_preparing",
    priority: 2,
    when: (ctx) => ctx.coreMissingCount > 0,
    build: (ctx) => ({
      id: "continue-preparing-core",
      category: "continue_preparing",
      priority: 2,
      title: "Continue preparing core packet fields",
      body: `${LEAD_IN} some core description areas are still open. ${USEFUL} finishing how your idea works and what feels different before a professional conversation.`,
      reasons: ["core_fields_missing"],
      action: {
        kind: "intake_step",
        href: intakeStepTarget(
          ctx.projectId,
          "idea",
          "Open invention basics",
        ).href,
        label: "Open invention basics",
      },
    }),
  },
  {
    id: "continue-preparing-materials",
    category: "continue_preparing",
    priority: 2,
    when: (ctx) => ctx.coreMissingCount === 0 && ctx.materialsCount === 0,
    build: (ctx) => ({
      id: "continue-preparing-materials",
      category: "continue_preparing",
      priority: 2,
      title: "Organize supporting materials",
      body: `${LEAD_IN} you have not listed supporting materials yet. ${USEFUL} attaching sketches, photos, or notes you already have.`,
      reasons: ["materials_missing"],
      action: {
        kind: "intake_step",
        href: intakeStepTarget(
          ctx.projectId,
          "materials",
          "Open materials",
        ).href,
        label: "Open materials & prototype",
      },
    }),
  },
  {
    id: "timeline-prep",
    category: "continue_preparing",
    priority: 3,
    when: (ctx) => ctx.timelineFilledCount < 3,
    build: (ctx) => ({
      id: "timeline-prep",
      category: "continue_preparing",
      priority: 3,
      title: "Fill in development timeline",
      body: `${LEAD_IN} your timeline has few dates recorded. ${USEFUL} adding approximate month/year milestones you remember.`,
      reasons: ["timeline_incomplete"],
      action: {
        kind: "profile_anchor",
        href: profileAnchorTarget(
          ctx.projectId,
          PROFILE_ANCHORS.developmentTimeline,
          "Open timeline",
        ).href,
        label: "Open development timeline",
      },
    }),
  },
  {
    id: "disclosure-clarity",
    category: "review_public_disclosure",
    priority: 3,
    when: (ctx) =>
      ctx.record.profile.publicDisclosure &&
      !ctx.hasPastDisclosureWithoutReliableDate,
    build: (ctx) => ({
      id: "disclosure-clarity",
      category: "review_public_disclosure",
      priority: 3,
      title: "Clarify public sharing history",
      body: `${LEAD_IN} you noted public sharing. ${USEFUL} confirming where and how you shared so a professional has accurate context.`,
      reasons: ["public_disclosure_unclear"],
      action: {
        kind: "intake_step",
        href: intakeStepTarget(
          ctx.projectId,
          "timeline",
          "Open disclosures",
        ).href,
        label: "Open disclosures & inventorship",
      },
    }),
  },
  {
    id: "similar-reference-prep",
    category: "similar_reference_prep",
    priority: 3,
    when: (ctx) => ctx.savedReferenceCount === 0,
    build: (ctx) => ({
      id: "similar-reference-prep",
      category: "similar_reference_prep",
      priority: 3,
      title: "Save possible similar references",
      body: `${LEAD_IN} you have not saved similar references yet. ${USEFUL} noting one to three possibilities from public search tools for a professional to review.`,
      reasons: ["similar_references_missing"],
      action: {
        kind: "research",
        href: researchTarget(ctx.projectId, "Open research workspace").href,
        label: "Open research workspace",
      },
    }),
  },
  {
    id: "speak-professional",
    category: "speak_patent_professional",
    priority: 4,
    when: (ctx) => ctx.isReadyForProfessionalConversation,
    build: (ctx) => ({
      id: "speak-professional",
      category: "speak_patent_professional",
      priority: 4,
      title: "Speak with a patent professional or clinic",
      body: `${LEAD_IN} your core packet fields look organized. ${USEFUL} bringing this preparation packet to a patent agent, attorney, clinic, or mentor for an educational review — not a filing decision.`,
      reasons: ["professional_review_ready"],
      action: {
        kind: "in_page",
        href: `${ROUTES.profile(ctx.projectId)}#export`,
        label: "Review export options",
      },
    }),
  },
  {
    id: "uri-innovations-primary",
    category: "explore_university_nonprofit",
    priority: 5,
    lastVerifiedAt: "2026-08-01",
    verifiedBy: "smartprobonoip_ops",
    jurisdictions: ["Rhode Island", "United States"],
    eligibilityNotes:
      "Primarily serves University of Rhode Island-affiliated inventors.",
    handoffMode: "external_link",
    when: (ctx) => ctx.hasUriAffiliation,
    build: (ctx) =>
      partnerRec("uri_innovations", ctx, {
        id: "uri-innovations-primary",
        category: "explore_university_nonprofit",
        priority: 5,
        title: "Explore URI Innovations",
        body: `${LEAD_IN} you noted a university or URI affiliation. ${USEFUL} contacting URI Innovations about disclosure or commercialization pathways that may apply to affiliated inventors.`,
        reasons: ["university_affiliation"],
      }) ?? {
        id: "uri-innovations-primary",
        category: "explore_university_nonprofit",
        priority: 5,
        title: "Explore university innovation resources",
        body: `${LEAD_IN} you noted institutional work. ${USEFUL} asking your institution's technology transfer office about disclosure pathways.`,
        reasons: ["university_affiliation"],
        action: {
          kind: "internal_link",
          href: ROUTES.learn,
          label: "Review education topics",
        },
      },
  },
  {
    id: "ppl-ptrc",
    category: "visit_ptrc",
    priority: 5,
    when: (ctx) => ctx.isRhodeIsland,
    build: (ctx) => {
      const rec = partnerRec("ppl_ptrc", ctx, {
        id: "ppl-ptrc",
        category: "visit_ptrc",
        priority: 5,
        title: "Visit Providence Public Library PTRC",
        body: `${LEAD_IN} you are in Rhode Island. ${USEFUL} visiting the Providence Public Library PTRC for public patent search education — staff orient you to tools; they do not provide legal review.`,
        reasons: ["local_ptrc_match"],
      });
      if (!rec) {
        return {
          id: "ppl-ptrc-fallback",
          category: "visit_ptrc" as const,
          priority: 5 as const,
          title: "Visit a Patent and Trademark Resource Center",
          body: `${USEFUL} locating a PTRC for public search education — staff do not provide legal review.`,
          reasons: ["local_ptrc_match"] as const,
          action: {
            kind: "internal_link" as const,
            href: ROUTES.learn,
            label: "Learn about PTRCs",
          },
        };
      }
      return rec;
    },
  },
  {
    id: "uspto-ptrc-directory",
    category: "visit_ptrc",
    priority: 5,
    when: (ctx) => !ctx.isRhodeIsland,
    build: (ctx) => {
      const rec = partnerRec("uspto_ptrc_directory", ctx, {
        id: "uspto-ptrc-directory",
        category: "visit_ptrc",
        priority: 5,
        title: "Find a Patent and Trademark Resource Center",
        body: `${USEFUL} locating a USPTO-designated PTRC near you for search education and public resource orientation — not legal advice or application review.`,
        reasons: ["local_ptrc_match"],
      });
      return (
        rec ?? {
          id: "uspto-ptrc-fallback",
          category: "visit_ptrc" as const,
          priority: 5 as const,
          title: "Find a Patent and Trademark Resource Center",
          body: `${USEFUL} locating a PTRC for public search education.`,
          reasons: ["local_ptrc_match"] as const,
          action: {
            kind: "internal_link" as const,
            href: ROUTES.learn,
            label: "Learn about PTRCs",
          },
        }
      );
    },
  },
  {
    id: "patent-pro-bono",
    category: "speak_patent_professional",
    priority: 5,
    when: (ctx) => ctx.record.answers.wantsProBono,
    build: (ctx) => {
      const rec = partnerRec("uspto_patent_pro_bono", ctx, {
        id: "patent-pro-bono",
        category: "speak_patent_professional",
        priority: 5,
        title: "Ask about Patent Pro Bono programs",
        body: `${LEAD_IN} you noted interest in pro bono support. ${USEFUL} reviewing the official USPTO Patent Pro Bono directory — eligibility varies and SmartProBonoIP does not determine whether you qualify.`,
        reasons: ["pro_bono_interest"],
      });
      return (
        rec ?? {
          id: "patent-pro-bono-fallback",
          category: "speak_patent_professional" as const,
          priority: 5 as const,
          title: "Ask about pro bono resources",
          body: `${LEAD_IN} you noted pro bono interest. ${USEFUL} asking a clinic or partner about programs that may fit — SmartProBonoIP does not determine eligibility.`,
          reasons: ["pro_bono_interest"] as const,
          action: {
            kind: "internal_link" as const,
            href: ROUTES.learn,
            label: "Review education topics",
          },
        }
      );
    },
  },
  {
    id: "review-education",
    category: "review_education",
    priority: 6,
    when: (ctx) => ctx.readiness.overallScore < 70,
    build: (ctx) => ({
      id: "review-education",
      category: "review_education",
      priority: 6,
      title: "Review IP preparation education",
      body: `${USEFUL} reading short education topics on disclosure, search prep, and professional handoffs before your next conversation.`,
      reasons: ["education_helpful"],
      partnerId: "internal_learn",
      action: {
        kind: "internal_link",
        href: PARTNER_REGISTRY.internal_learn.buildDestination({
          projectId: ctx.projectId,
        }),
        label: "Open Learn",
      },
    }),
  },
  {
    id: "save-export-packet",
    category: "save_export_packet",
    priority: 6,
    when: (ctx) => ctx.coreMissingCount === 0,
    build: (ctx) => ({
      id: "save-export-packet",
      category: "save_export_packet",
      priority: 6,
      title: "Save or export your packet",
      body: `${LEAD_IN} your core fields are filled. ${USEFUL} downloading a PDF or export to bring to a professional conversation.`,
      reasons: ["export_helpful"],
      partnerId: "internal_export",
      action: {
        kind: "profile_anchor",
        href: `${ROUTES.profile(ctx.projectId)}#export`,
        label: "Open export section",
      },
    }),
  },
];

/** Secondary-only entries for "View all resources" when URI affiliation is absent. */
export const VIEW_ALL_PARTNER_IDS = [
  "uri_innovations",
  "ppl_ptrc",
  "uspto_ptrc_directory",
  "uspto_patent_pro_bono",
  "internal_learn",
  "internal_trust",
  "internal_for_professionals",
  "internal_research",
  "internal_export",
  "internal_recovery",
] as const;

export function buildViewAllRecommendations(
  ctx: RoutingContext,
): BuiltRecommendation[] {
  const recs: BuiltRecommendation[] = [];

  for (const partnerId of VIEW_ALL_PARTNER_IDS) {
    const partner = getPartner(partnerId);
    if (!partner || !isPartnerPersonalizable(partner)) continue;

    if (partnerId === "uri_innovations" && !ctx.hasUriAffiliation) {
      recs.push({
        id: `view-all-${partnerId}`,
        category: "explore_university_nonprofit",
        priority: 5,
        title: partner.name,
        body: `${partner.description} Listed for reference — primary routing for URI Innovations applies when a URI affiliation signal is present.`,
        whyRecommended: formatWhyRecommended(["generic_fallback"]),
        reasons: ["generic_fallback"],
        partnerId,
        isUrgent: false,
        action: {
          kind:
            partner.orgType === "internal_platform"
              ? "internal_link"
              : "external_link",
          href: partner.buildDestination({
            projectId: ctx.projectId,
            utmCampaign: `view_all_${partnerId}`,
          }),
          label: `View ${partner.name}`,
        },
      });
      continue;
    }

    if (partnerId === "ppl_ptrc" && !ctx.isRhodeIsland) continue;

    recs.push({
      id: `view-all-${partnerId}`,
      category:
        partnerId === "uspto_patent_pro_bono"
          ? "speak_patent_professional"
          : partnerId.includes("ptrc")
            ? "visit_ptrc"
            : partnerId === "uri_innovations"
              ? "explore_university_nonprofit"
              : partnerId === "internal_research"
                ? "similar_reference_prep"
                : partnerId === "internal_export"
                  ? "save_export_packet"
                  : "review_education",
      priority: 6,
      title: partner.name,
      body: `${partner.description} ${partner.disclaimer}`,
      whyRecommended: formatWhyRecommended(["generic_fallback"]),
      reasons: ["generic_fallback"],
      partnerId,
      isUrgent: false,
      action: {
        kind:
          partner.orgType === "internal_platform" ? "internal_link" : "external_link",
        href: partner.buildDestination({
          projectId: ctx.projectId,
          utmCampaign: `view_all_${partnerId}`,
        }),
        label: `View ${partner.name}`,
      },
    });
  }

  return recs;
}
