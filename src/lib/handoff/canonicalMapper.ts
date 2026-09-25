import "server-only";

import { getSupabaseService } from "@/lib/supabaseServer";
import type {
  ProfessionalHandoffAnswer,
  ProfessionalHandoffSession,
} from "@/lib/types";

const TEMPLATE_KEY = "patent_professional_core_v1";

interface TemplateRow {
  id: string;
  organization_name: string | null;
  template_name: string;
}

interface QuestionRow {
  id: string;
  external_key: string | null;
  section_name: string | null;
  question_text: string;
  required_by_professional: boolean;
  display_order: number | null;
}

interface MappingRow {
  question_id: string;
  canonical_key: string;
  mapping_type: "direct" | "composite" | "transform" | "manual";
}

function present(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

function line(parts: Array<string | null | undefined>): string {
  return parts.filter((part) => part?.trim()).join(" · ");
}

async function loadCanonicalValues(projectId: string): Promise<Record<string, unknown>> {
  const sb = getSupabaseService();
  const [
    projectRes,
    technicalRes,
    contributorsRes,
    disclosuresRes,
    fundingRes,
    ownershipRes,
    priorAppsRes,
    refsRes,
  ] = await Promise.all([
    sb.from("smartprobonoip_projects").select("title").eq("id", projectId).maybeSingle(),
    sb
      .from("smartprobonoip_technical_disclosures")
      .select(
        "problem_or_need, detailed_description, key_components_or_steps, how_it_works, best_known_implementation, alternatives_variations",
      )
      .eq("project_id", projectId)
      .maybeSingle(),
    sb
      .from("smartprobonoip_contributors")
      .select(
        "legal_first_name, legal_middle_name, legal_last_name, employer_affiliation, contribution_description, user_identified_role",
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
    sb
      .from("smartprobonoip_disclosure_events")
      .select(
        "event_type, event_date, anticipated, what_was_shared, audience_description, access_scope, confidentiality_basis, location_or_channel, notes",
      )
      .eq("project_id", projectId)
      .order("event_date", { ascending: true, nullsFirst: false }),
    sb
      .from("smartprobonoip_funding_sources")
      .select(
        "source_type, sponsor_name, grant_contract_number, awardee_entity, institution_resources_used, notes",
      )
      .eq("project_id", projectId),
    sb
      .from("smartprobonoip_ownership_relationships")
      .select(
        "relationship_type, party_name, agreement_type, obligation_to_assign_reported, effective_date, notes",
      )
      .eq("project_id", projectId),
    sb
      .from("smartprobonoip_prior_applications")
      .select(
        "application_type, application_number, authority_country, filing_date, title, relationship_type, notes",
      )
      .eq("project_id", projectId),
    sb
      .from("smartprobonoip_saved_references")
      .select(
        "reference_title, reference_identifier, publication_date, reference_url, reference_type, user_notes, notes",
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
  ]);

  for (const result of [
    projectRes,
    technicalRes,
    contributorsRes,
    disclosuresRes,
    fundingRes,
    ownershipRes,
    priorAppsRes,
    refsRes,
  ]) {
    if (result.error) throw new Error(result.error.message);
  }

  const technical = technicalRes.data as Record<string, unknown> | null;
  const contributors = (contributorsRes.data ?? []) as Array<Record<string, unknown>>;
  const disclosures = (disclosuresRes.data ?? []) as Array<Record<string, unknown>>;
  const funding = (fundingRes.data ?? []) as Array<Record<string, unknown>>;
  const ownership = (ownershipRes.data ?? []) as Array<Record<string, unknown>>;
  const priorApps = (priorAppsRes.data ?? []) as Array<Record<string, unknown>>;
  const refs = (refsRes.data ?? []) as Array<Record<string, unknown>>;

  return {
    "project.title": projectRes.data?.title ?? null,
    "technical.problem_or_need": technical?.problem_or_need ?? null,
    "technical.detailed_description": technical?.detailed_description ?? null,
    "technical.key_components_or_steps": technical?.key_components_or_steps ?? null,
    "technical.how_it_works": technical?.how_it_works ?? null,
    "technical.best_known_implementation": technical?.best_known_implementation ?? null,
    "technical.alternatives_variations": technical?.alternatives_variations ?? null,
    "contributors.collection": contributors.map((row) =>
      line([
        line([
          row.legal_first_name as string | null,
          row.legal_middle_name as string | null,
          row.legal_last_name as string | null,
        ]),
        row.user_identified_role ? `role: ${String(row.user_identified_role).replaceAll("_", " ")}` : null,
        row.employer_affiliation ? `affiliation: ${String(row.employer_affiliation)}` : null,
        row.contribution_description ? `contribution: ${String(row.contribution_description)}` : null,
      ]),
    ).filter(Boolean).join("\n"),
    "disclosure_events.collection": disclosures.map((row) =>
      line([
        String(row.event_type ?? "").replaceAll("_", " "),
        row.event_date ? String(row.event_date) : row.anticipated ? "anticipated" : null,
        row.location_or_channel ? `where: ${String(row.location_or_channel)}` : null,
        row.audience_description ? `audience: ${String(row.audience_description)}` : null,
        row.what_was_shared ? `shared: ${String(row.what_was_shared)}` : null,
        row.confidentiality_basis ? `confidentiality: ${String(row.confidentiality_basis).replaceAll("_", " ")}` : null,
        row.notes ? String(row.notes) : null,
      ]),
    ).filter(Boolean).join("\n"),
    "funding_sources.collection": funding.map((row) =>
      line([
        row.source_type ? String(row.source_type).replaceAll("_", " ") : null,
        row.sponsor_name as string | null,
        row.grant_contract_number ? `award/contract: ${String(row.grant_contract_number)}` : null,
        row.awardee_entity ? `awardee: ${String(row.awardee_entity)}` : null,
        row.institution_resources_used ? `institution resources: ${String(row.institution_resources_used)}` : null,
        row.notes as string | null,
      ]),
    ).filter(Boolean).join("\n"),
    "ownership_relationships.collection": ownership.map((row) =>
      line([
        row.relationship_type ? String(row.relationship_type).replaceAll("_", " ") : null,
        row.party_name as string | null,
        row.agreement_type ? `agreement: ${String(row.agreement_type).replaceAll("_", " ")}` : null,
        row.obligation_to_assign_reported ? `obligation to assign reported: ${String(row.obligation_to_assign_reported)}` : null,
        row.effective_date ? `effective: ${String(row.effective_date)}` : null,
        row.notes as string | null,
      ]),
    ).filter(Boolean).join("\n"),
    "prior_applications.collection": priorApps.map((row) =>
      line([
        row.application_type ? String(row.application_type).replaceAll("_", " ") : null,
        row.application_number as string | null,
        row.authority_country as string | null,
        row.filing_date ? `filed: ${String(row.filing_date)}` : null,
        row.title as string | null,
        row.relationship_type ? `relationship: ${String(row.relationship_type).replaceAll("_", " ")}` : null,
      ]),
    ).filter(Boolean).join("\n"),
    "saved_references.collection": refs.map((row) =>
      line([
        row.reference_title as string | null,
        row.reference_identifier as string | null,
        row.publication_date ? `published: ${String(row.publication_date)}` : null,
        row.reference_type ? String(row.reference_type).replaceAll("_", " ") : null,
        row.reference_url as string | null,
        (row.user_notes ?? row.notes) as string | null,
      ]),
    ).filter(Boolean).join("\n"),
  };
}

async function loadTemplate(): Promise<{
  template: TemplateRow;
  questions: QuestionRow[];
  mappings: MappingRow[];
}> {
  const sb = getSupabaseService();
  const { data: template, error: templateError } = await sb
    .from("smartprobonoip_intake_templates")
    .select("id, organization_name, template_name")
    .eq("template_key", TEMPLATE_KEY)
    .eq("mapping_status", "verified")
    .maybeSingle();
  if (templateError) throw new Error(templateError.message);
  if (!template) throw new Error("Professional intake template is not configured");

  const { data: questions, error: questionError } = await sb
    .from("smartprobonoip_intake_questions")
    .select("id, external_key, section_name, question_text, required_by_professional, display_order")
    .eq("template_id", template.id)
    .order("display_order", { ascending: true });
  if (questionError) throw new Error(questionError.message);

  const questionIds = (questions ?? []).map((question) => question.id as string);
  const { data: mappings, error: mappingError } = questionIds.length
    ? await sb
        .from("smartprobonoip_field_mappings")
        .select("question_id, canonical_key, mapping_type")
        .in("question_id", questionIds)
        .eq("verification_status", "human_verified")
    : { data: [], error: null };
  if (mappingError) throw new Error(mappingError.message);

  return {
    template: template as TemplateRow,
    questions: (questions ?? []) as QuestionRow[],
    mappings: (mappings ?? []) as MappingRow[],
  };
}

async function loadSession(sessionId: string): Promise<ProfessionalHandoffSession | null> {
  const sb = getSupabaseService();
  const { data: session, error } = await sb
    .from("smartprobonoip_handoff_sessions")
    .select(
      "id, template_id, status, unresolved_question_count, mapped_question_count, created_at, updated_at, smartprobonoip_intake_templates(template_name, organization_name)",
    )
    .eq("id", sessionId)
    .maybeSingle();
  if (error || !session) return null;

  const { data: answers, error: answerError } = await sb
    .from("smartprobonoip_handoff_answers")
    .select(
      "id, question_id, source_canonical_keys, answer_value, resolution_method, confidence, user_approved_at, smartprobonoip_intake_questions(section_name, question_text, required_by_professional, display_order)",
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (answerError) throw new Error(answerError.message);

  const template = Array.isArray(session.smartprobonoip_intake_templates)
    ? session.smartprobonoip_intake_templates[0]
    : session.smartprobonoip_intake_templates;

  const mappedAnswersWithOrder: Array<{
    answer: ProfessionalHandoffAnswer;
    displayOrder: number;
  }> = [];

  for (const row of answers ?? []) {
    const question = Array.isArray(row.smartprobonoip_intake_questions)
      ? row.smartprobonoip_intake_questions[0]
      : row.smartprobonoip_intake_questions;
    if (!question) continue;

    mappedAnswersWithOrder.push({
      answer: {
        id: row.id as string,
        questionId: row.question_id as string,
        sectionName: (question.section_name as string | null) ?? null,
        questionText: question.question_text as string,
        requiredByProfessional: Boolean(question.required_by_professional),
        sourceCanonicalKeys:
          (row.source_canonical_keys as string[] | null) ?? [],
        answerValue: row.answer_value,
        resolutionMethod:
          row.resolution_method as ProfessionalHandoffAnswer["resolutionMethod"],
        confidence:
          row.confidence as ProfessionalHandoffAnswer["confidence"],
        userApprovedAt: (row.user_approved_at as string | null) ?? null,
      },
      displayOrder: (question.display_order as number | null) ?? 0,
    });
  }

  const mappedAnswers = mappedAnswersWithOrder
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((item) => item.answer);

  return {
    id: session.id as string,
    templateName: (template?.template_name as string | undefined) ?? "Professional intake",
    organizationName: (template?.organization_name as string | null | undefined) ?? null,
    status: session.status as ProfessionalHandoffSession["status"],
    unresolvedQuestionCount: Number(session.unresolved_question_count ?? 0),
    mappedQuestionCount: Number(session.mapped_question_count ?? 0),
    answers: mappedAnswers,
    createdAt: session.created_at as string,
    updatedAt: session.updated_at as string,
  };
}

export async function getLatestProfessionalHandoff(
  projectId: string,
): Promise<ProfessionalHandoffSession | null> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_handoff_sessions")
    .select("id")
    .eq("project_id", projectId)
    .neq("status", "cancelled")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data?.id) return null;
  return loadSession(data.id as string);
}

export async function prepareProfessionalHandoff(input: {
  projectId: string;
  pilotSessionId: string;
}): Promise<ProfessionalHandoffSession> {
  const sb = getSupabaseService();
  const [{ template, questions, mappings }, values] = await Promise.all([
    loadTemplate(),
    loadCanonicalValues(input.projectId),
  ]);

  let { data: session, error: sessionError } = await sb
    .from("smartprobonoip_handoff_sessions")
    .select("id")
    .eq("project_id", input.projectId)
    .eq("template_id", template.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sessionError) throw new Error(sessionError.message);

  if (!session) {
    const created = await sb
      .from("smartprobonoip_handoff_sessions")
      .insert({
        project_id: input.projectId,
        pilot_session_id: input.pilotSessionId,
        template_id: template.id,
        status: "draft",
      })
      .select("id")
      .single();
    if (created.error || !created.data) {
      throw new Error(created.error?.message ?? "Could not create professional handoff");
    }
    session = created.data;
  }

  const mappingsByQuestion = new Map<string, MappingRow[]>();
  for (const mapping of mappings) {
    const current = mappingsByQuestion.get(mapping.question_id) ?? [];
    current.push(mapping);
    mappingsByQuestion.set(mapping.question_id, current);
  }

  const { data: existingRows, error: existingError } = await sb
    .from("smartprobonoip_handoff_answers")
    .select("question_id, resolution_method, answer_value, user_approved_at")
    .eq("session_id", session.id);
  if (existingError) throw new Error(existingError.message);
  const existing = new Map(
    (existingRows ?? []).map((row) => [row.question_id as string, row]),
  );

  const rows = questions.map((question) => {
    const prior = existing.get(question.id);
    if (
      prior &&
      (prior.resolution_method === "user_answered" ||
        prior.resolution_method === "professional_answered")
    ) {
      return {
        session_id: session!.id,
        question_id: question.id,
        source_canonical_keys: [],
        answer_value: prior.answer_value,
        resolution_method: prior.resolution_method,
        confidence: "exact",
        user_approved_at: prior.user_approved_at,
        updated_at: new Date().toISOString(),
      };
    }

    const questionMappings = mappingsByQuestion.get(question.id) ?? [];
    const keys = questionMappings.map((mapping) => mapping.canonical_key);
    const resolved = questionMappings
      .map((mapping) => values[mapping.canonical_key])
      .find(present);
    const hasValue = present(resolved);
    const composite = questionMappings.some((mapping) => mapping.mapping_type !== "direct");

    const nextValue = hasValue ? resolved : null;
    const valueUnchanged =
      JSON.stringify(prior?.answer_value ?? null) === JSON.stringify(nextValue);

    return {
      session_id: session!.id,
      question_id: question.id,
      source_canonical_keys: keys,
      answer_value: nextValue,
      resolution_method: hasValue ? (composite ? "composite_map" : "direct_map") : "unresolved",
      confidence: hasValue ? (composite ? "review_required" : "exact") : "unresolved",
      user_approved_at: valueUnchanged ? (prior?.user_approved_at ?? null) : null,
      updated_at: new Date().toISOString(),
    };
  });

  const { error: answerError } = await sb
    .from("smartprobonoip_handoff_answers")
    .upsert(rows, { onConflict: "session_id,question_id" });
  if (answerError) throw new Error(answerError.message);

  const unresolvedQuestionCount = rows.filter((row) => row.resolution_method === "unresolved").length;
  const mappedQuestionCount = rows.length - unresolvedQuestionCount;
  const status = unresolvedQuestionCount > 0 ? "needs_user_input" : "ready_for_review";

  const { error: updateError } = await sb
    .from("smartprobonoip_handoff_sessions")
    .update({
      unresolved_question_count: unresolvedQuestionCount,
      mapped_question_count: mappedQuestionCount,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.id);
  if (updateError) throw new Error(updateError.message);

  const loaded = await loadSession(session.id as string);
  if (!loaded) throw new Error("Could not load professional handoff");
  return loaded;
}

export async function answerProfessionalHandoffQuestion(input: {
  projectId: string;
  sessionId: string;
  questionId: string;
  value: string;
}): Promise<ProfessionalHandoffSession> {
  const sb = getSupabaseService();
  const value = input.value.trim();
  if (!value) throw new Error("Answer cannot be blank");

  const { data: session, error: sessionError } = await sb
    .from("smartprobonoip_handoff_sessions")
    .select("id")
    .eq("id", input.sessionId)
    .eq("project_id", input.projectId)
    .maybeSingle();
  if (sessionError || !session) throw new Error("Professional handoff not found");

  const now = new Date().toISOString();
  const { data: updated, error: answerError } = await sb
    .from("smartprobonoip_handoff_answers")
    .update({
      answer_value: value,
      resolution_method: "user_answered",
      confidence: "exact",
      user_approved_at: now,
      updated_at: now,
    })
    .eq("session_id", input.sessionId)
    .eq("question_id", input.questionId)
    .select("id")
    .maybeSingle();
  if (answerError || !updated) throw new Error("Professional intake question not found");

  const { data: answerRows, error: countError } = await sb
    .from("smartprobonoip_handoff_answers")
    .select("resolution_method, user_approved_at")
    .eq("session_id", input.sessionId);
  if (countError) throw new Error(countError.message);

  const rows = answerRows ?? [];
  const unresolvedQuestionCount = rows.filter(
    (row) => row.resolution_method === "unresolved",
  ).length;
  const mappedQuestionCount = rows.length - unresolvedQuestionCount;
  const allResolvedApproved =
    unresolvedQuestionCount === 0 &&
    rows.length > 0 &&
    rows.every((row) => Boolean(row.user_approved_at));

  const { error: updateError } = await sb
    .from("smartprobonoip_handoff_sessions")
    .update({
      unresolved_question_count: unresolvedQuestionCount,
      mapped_question_count: mappedQuestionCount,
      status: allResolvedApproved
        ? "approved"
        : unresolvedQuestionCount > 0
          ? "needs_user_input"
          : "ready_for_review",
      approved_at: allResolvedApproved ? now : null,
      updated_at: now,
    })
    .eq("id", input.sessionId);
  if (updateError) throw new Error(updateError.message);

  const loaded = await loadSession(input.sessionId);
  if (!loaded) throw new Error("Could not load professional handoff");
  return loaded;
}

export async function approveMappedProfessionalHandoff(
  projectId: string,
  sessionId: string,
): Promise<ProfessionalHandoffSession> {
  const sb = getSupabaseService();
  const { data: session, error: sessionError } = await sb
    .from("smartprobonoip_handoff_sessions")
    .select("id, unresolved_question_count")
    .eq("id", sessionId)
    .eq("project_id", projectId)
    .maybeSingle();
  if (sessionError || !session) throw new Error("Professional handoff not found");

  const approvedAt = new Date().toISOString();
  const { error: answerError } = await sb
    .from("smartprobonoip_handoff_answers")
    .update({ user_approved_at: approvedAt, updated_at: approvedAt })
    .eq("session_id", sessionId)
    .neq("resolution_method", "unresolved");
  if (answerError) throw new Error(answerError.message);

  const nextStatus =
    Number(session.unresolved_question_count ?? 0) === 0 ? "approved" : "needs_user_input";
  const { error: updateError } = await sb
    .from("smartprobonoip_handoff_sessions")
    .update({
      status: nextStatus,
      approved_at: nextStatus === "approved" ? approvedAt : null,
      updated_at: approvedAt,
    })
    .eq("id", sessionId);
  if (updateError) throw new Error(updateError.message);

  const loaded = await loadSession(sessionId);
  if (!loaded) throw new Error("Could not load professional handoff");
  return loaded;
}
