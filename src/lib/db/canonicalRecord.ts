import "server-only";

import { getSupabaseService } from "@/lib/supabaseServer";
import type {
  DevelopmentTimeline,
  DevelopmentTimelineField,
  IntakeAnswers,
} from "@/lib/types";

type TriState = "yes" | "no" | "unknown";

const GENERATED_FLAG_CODES = [
  "AUTO_CONTRIBUTORSHIP",
  "AUTO_EXTERNAL_DISCLOSURE",
  "AUTO_FUNDING_RIGHTS",
  "AUTO_ASSIGNMENT_OWNERSHIP",
] as const;

const TIMELINE_EVENT_TYPES: Record<DevelopmentTimelineField, string> = {
  "Date idea started": "idea_started",
  "Date first written down or sketched": "first_documented",
  "Date first prototype built": "first_prototype",
  "Date first shared publicly": "first_public_sharing",
  "Date first pitched, sold, or demoed": "first_pitch_sale_demo",
  "Date of major improvements": "major_improvement",
  "Date first shown privately": "first_private_sharing",
};

function contributorState(answers: IntakeAnswers): TriState {
  if (!answers.contributorsInvolved) return "unknown";
  if (answers.contributorsInvolved === "solo") return "no";
  if (answers.contributorsInvolved === "not_sure") return "unknown";
  return "yes";
}

function disclosureState(answers: IntakeAnswers): TriState {
  if (!Array.isArray(answers.sharedChannels)) return "unknown";
  const nonNone = answers.sharedChannels.filter((channel) => channel !== "none");
  return nonNone.length > 0 ? "yes" : "no";
}

function institutionState(answers: IntakeAnswers): TriState {
  if (answers.institutionRelationship === "yes") return "yes";
  if (answers.institutionRelationship === "no") return "no";
  return "unknown";
}

function assignmentState(answers: IntakeAnswers): TriState {
  if (answers.agreementStatus === "yes") return "yes";
  if (
    answers.agreementStatus === "no" ||
    answers.agreementStatus === "not_applicable"
  ) {
    return "no";
  }
  return "unknown";
}

function knownReferenceState(answers: IntakeAnswers): TriState {
  return answers.knownSimilarWork?.trim() ? "yes" : "unknown";
}

function exactIsoDate(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10) === trimmed ? trimmed : null;
}

function timelinePrecision(value: string): "exact" | "approximate" | "unknown" {
  if (exactIsoDate(value)) return "exact";
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "unknown" ||
    normalized === "not sure" ||
    normalized === "i don't remember" ||
    normalized === "i don’t remember" ||
    normalized === "not yet"
  ) {
    return "unknown";
  }
  return "approximate";
}

/**
 * Mirrors the current intake payload into the normalized canonical record.
 * This is preparation data only. It never stores a patentability, inventorship,
 * ownership, prior-art materiality, or legal-deadline conclusion.
 */
export async function syncCanonicalRecordFromAnswers(input: {
  projectId: string;
  pilotSessionId: string;
  answers: IntakeAnswers;
}): Promise<void> {
  const { projectId, pilotSessionId, answers } = input;
  const sb = getSupabaseService();

  const contributors = contributorState(answers);
  const disclosure = disclosureState(answers);
  const institution = institutionState(answers);
  const assignment = assignmentState(answers);

  const [technicalRes, screeningRes] = await Promise.all([
    sb.from("smartprobonoip_technical_disclosures").upsert(
      {
        project_id: projectId,
        pilot_session_id: pilotSessionId,
        problem_or_need: answers.problemSolved || null,
        detailed_description: answers.whatCreated || null,
        key_components_or_steps: answers.mainParts || null,
        how_it_works: answers.howItWorks || null,
        advantages_improvements: answers.whatDifferent || null,
        alternatives_variations: answers.alternativeVersions || null,
        best_known_implementation: answers.preferredEmbodiment || null,
        prototype_status: answers.hasPrototype ? "yes" : "no",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" },
    ),
    sb.from("smartprobonoip_screening").upsert(
      {
        project_id: projectId,
        pilot_session_id: pilotSessionId,
        other_contributors_known: contributors,
        external_disclosure_known: disclosure,
        upcoming_disclosure_known: "unknown",
        sale_or_offer_known: "unknown",
        external_use_known: "unknown",
        external_funding_known: institution,
        institution_resources_known: institution,
        third_party_materials_known: "unknown",
        assignment_relationship_known: assignment,
        prior_filing_known: "unknown",
        known_reference_known: knownReferenceState(answers),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" },
    ),
  ]);

  if (technicalRes.error) throw new Error(technicalRes.error.message);
  if (screeningRes.error) throw new Error(screeningRes.error.message);

  // Remove only still-open generated flags before recalculating them. Resolved or
  // dismissed flags remain as part of the user's preparation history.
  const { error: deleteFlagError } = await sb
    .from("smartprobonoip_review_flags")
    .delete()
    .eq("project_id", projectId)
    .eq("status", "open")
    .in("trigger_code", [...GENERATED_FLAG_CODES]);
  if (deleteFlagError) throw new Error(deleteFlagError.message);

  const flags: Array<Record<string, unknown>> = [];

  if (contributors === "yes") {
    flags.push({
      project_id: projectId,
      pilot_session_id: pilotSessionId,
      trigger_code: "AUTO_CONTRIBUTORSHIP",
      flag_type: "professional_review_recommended",
      canonical_key: "people.contributions",
      factual_basis: {
        contributorsInvolved: answers.contributorsInvolved ?? null,
        contributorHelpTypes: answers.contributorHelpTypes ?? [],
      },
      user_message:
        "More than one person may have contributed to the technical work. Preserve what each person contributed for professional review.",
    });
  } else if (contributors === "unknown") {
    flags.push({
      project_id: projectId,
      pilot_session_id: pilotSessionId,
      trigger_code: "AUTO_CONTRIBUTORSHIP",
      flag_type: "needs_user_clarification",
      canonical_key: "people.contributions",
      factual_basis: {
        contributorsInvolved: answers.contributorsInvolved ?? null,
      },
      user_message:
        "Contributor details are not clear yet. Add who helped and what they contributed before professional review.",
    });
  }

  if (disclosure === "yes") {
    flags.push({
      project_id: projectId,
      pilot_session_id: pilotSessionId,
      trigger_code: "AUTO_EXTERNAL_DISCLOSURE",
      flag_type: "professional_review_recommended",
      canonical_key: "disclosure.events",
      factual_basis: {
        sharedChannels: answers.sharedChannels,
      },
      user_message:
        "You reported sharing information outside your private team. Preserve what was shared, when, with whom, and any confidentiality terms for professional review.",
    });
  }

  if (institution === "yes") {
    flags.push({
      project_id: projectId,
      pilot_session_id: pilotSessionId,
      trigger_code: "AUTO_FUNDING_RIGHTS",
      flag_type: "professional_review_recommended",
      canonical_key: "funding.sources",
      factual_basis: {
        institutionRelationship: answers.institutionRelationship ?? null,
      },
      user_message:
        "You reported an employer, school, grant, or institutional relationship. Preserve the related funding, resource, and agreement details for professional review.",
    });
  }

  if (assignment === "yes" || assignment === "unknown") {
    flags.push({
      project_id: projectId,
      pilot_session_id: pilotSessionId,
      trigger_code: "AUTO_ASSIGNMENT_OWNERSHIP",
      flag_type:
        assignment === "yes"
          ? "professional_review_recommended"
          : "needs_user_clarification",
      canonical_key: "ownership.relationships",
      factual_basis: {
        agreementStatus: answers.agreementStatus ?? null,
        agreementTypes: answers.agreementTypes ?? [],
      },
      user_message:
        assignment === "yes"
          ? "You reported an agreement that may address inventions or IP. Preserve the agreement for professional review."
          : "The agreement/ownership facts are not clear yet. Record any employment, contractor, founder, school, or funding agreements you know about.",
    });
  }

  if (flags.length > 0) {
    const { error } = await sb
      .from("smartprobonoip_review_flags")
      .upsert(flags, { onConflict: "project_id,trigger_code" });
    if (error) throw new Error(error.message);
  }
}

/**
 * Mirrors the existing free-text timeline into structured timeline rows while
 * preserving the original user-entered value. Only exact YYYY-MM-DD values are
 * promoted to a database date; all other values remain descriptive facts.
 */
export async function syncCanonicalTimeline(input: {
  projectId: string;
  pilotSessionId: string;
  timeline: DevelopmentTimeline;
}): Promise<void> {
  const { projectId, pilotSessionId, timeline } = input;
  const sb = getSupabaseService();

  const { error: deleteError } = await sb
    .from("smartprobonoip_timeline_events")
    .delete()
    .eq("project_id", projectId)
    .contains("metadata", { source: "legacy_timeline" });
  if (deleteError) throw new Error(deleteError.message);

  const rows = (Object.keys(TIMELINE_EVENT_TYPES) as DevelopmentTimelineField[])
    .map((field) => {
      const rawValue = timeline[field]?.trim();
      if (!rawValue) return null;
      return {
        project_id: projectId,
        pilot_session_id: pilotSessionId,
        event_type: TIMELINE_EVENT_TYPES[field],
        event_date: exactIsoDate(rawValue),
        date_precision: timelinePrecision(rawValue),
        description: rawValue,
        metadata: {
          source: "legacy_timeline",
          sourceField: field,
          rawValue,
        },
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) return;

  const { error } = await sb.from("smartprobonoip_timeline_events").insert(rows);
  if (error) throw new Error(error.message);
}
