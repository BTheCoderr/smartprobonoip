import "server-only";

import { getOrganizationById } from "@/lib/db/partnerOrganizations";
import { getSupabaseService } from "@/lib/supabaseServer";
import type {
  ParsedIntake,
  ParsedIntakeQuestion,
} from "@/lib/handoff/intakeImporter";
import { hashIntakeText } from "@/lib/handoff/intakeImporter";
import {
  canonicalFieldLabel,
  isCanonicalIntakeFieldKey,
} from "@/lib/handoff/canonicalFields";

export interface OrganizationIntakeTemplateListItem {
  id: string;
  templateName: string;
  version: string;
  mappingStatus: "draft" | "partially_verified" | "verified" | "retired";
  sourceFilename: string | null;
  parser: string | null;
  questionCount: number;
  mappedCount: number;
  firmOnlyCount: number;
  unreviewedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationIntakeQuestionView {
  id: string;
  sectionName: string | null;
  questionText: string;
  answerType: string;
  requiredByProfessional: boolean;
  displayOrder: number | null;
  mappingDisposition: "unreviewed" | "mapped" | "firm_only";
  mappingNotes: string | null;
  suggestedCanonicalKey: string | null;
  suggestedCanonicalLabel: string | null;
  verifiedCanonicalKey: string | null;
  verifiedCanonicalLabel: string | null;
}

export interface OrganizationIntakeTemplateView
  extends OrganizationIntakeTemplateListItem {
  organizationName: string | null;
  importId: string | null;
  sourceMode: string | null;
  questions: OrganizationIntakeQuestionView[];
}

interface QuestionRow {
  id: string;
  section_name: string | null;
  question_text: string;
  answer_type: string;
  required_by_professional: boolean;
  display_order: number | null;
  mapping_disposition: "unreviewed" | "mapped" | "firm_only";
  mapping_notes: string | null;
}

interface MappingRow {
  question_id: string;
  canonical_key: string;
  verification_status: "model_suggested" | "human_verified" | "rejected";
}

async function recalcTemplateStatus(
  templateId: string,
): Promise<OrganizationIntakeTemplateListItem["mappingStatus"]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_intake_questions")
    .select("mapping_disposition")
    .eq("template_id", templateId);
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const total = rows.length;
  const reviewed = rows.filter(
    (row) => row.mapping_disposition !== "unreviewed",
  ).length;
  const mappingStatus: OrganizationIntakeTemplateListItem["mappingStatus"] =
    total > 0 && reviewed === total
      ? "verified"
      : reviewed > 0
        ? "partially_verified"
        : "draft";

  const { error: updateError } = await sb
    .from("smartprobonoip_intake_templates")
    .update({
      mapping_status: mappingStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId);
  if (updateError) throw new Error(updateError.message);
  return mappingStatus;
}

export async function createOrganizationIntakeImport(input: {
  organizationId: string;
  actorUserId: string;
  importName: string;
  sourceMode: "paste" | "text_file";
  sourceFilename?: string | null;
  rawText: string;
  parsed: ParsedIntake;
}): Promise<OrganizationIntakeTemplateView> {
  const sb = getSupabaseService();
  const organization = await getOrganizationById(input.organizationId);
  if (!organization) throw new Error("Organization not found");

  const { data: importRow, error: importError } = await sb
    .from("smartprobonoip_intake_imports")
    .insert({
      organization_id: input.organizationId,
      created_by_user_id: input.actorUserId,
      import_name: input.importName.trim(),
      source_mode: input.sourceMode,
      source_filename: input.sourceFilename?.trim() || null,
      raw_text: input.rawText,
      raw_text_sha256: hashIntakeText(input.rawText),
      status: "parsed",
      extracted_question_count: input.parsed.questions.length,
      parser: input.parsed.parser,
    })
    .select("id")
    .single();
  if (importError || !importRow) {
    throw new Error(importError?.message ?? "Could not save intake import");
  }

  const { data: templateRow, error: templateError } = await sb
    .from("smartprobonoip_intake_templates")
    .insert({
      partner_organization_id: input.organizationId,
      organization_name: organization.name,
      template_name: input.importName.trim(),
      version: "1",
      source_type: "manual",
      mapping_status: "draft",
      source_import_id: importRow.id,
      notes:
        "Imported from the professional's own intake source. Suggested mappings require human review.",
    })
    .select("id")
    .single();

  if (templateError || !templateRow) {
    await sb
      .from("smartprobonoip_intake_imports")
      .delete()
      .eq("id", importRow.id);
    throw new Error(templateError?.message ?? "Could not create intake template");
  }

  const questionRows = input.parsed.questions.map((question, index) => ({
    template_id: templateRow.id,
    external_key: `import_q_${index + 1}`,
    section_name: question.sectionName,
    question_text: question.questionText,
    answer_type: question.answerType,
    required_by_professional: question.requiredByProfessional,
    options: [],
    display_order: (index + 1) * 10,
    mapping_disposition: "unreviewed",
  }));

  const { data: insertedQuestions, error: questionsError } = await sb
    .from("smartprobonoip_intake_questions")
    .insert(questionRows)
    .select("id, external_key");

  if (questionsError || !insertedQuestions) {
    await sb
      .from("smartprobonoip_intake_templates")
      .delete()
      .eq("id", templateRow.id);
    await sb
      .from("smartprobonoip_intake_imports")
      .delete()
      .eq("id", importRow.id);
    throw new Error(questionsError?.message ?? "Could not save intake questions");
  }

  const byExternal = new Map(
    insertedQuestions.map((row) => [row.external_key as string, row.id as string]),
  );

  const mappingRows = input.parsed.questions
    .map((question, index) => {
      if (!question.suggestedCanonicalKey) return null;
      const questionId = byExternal.get(`import_q_${index + 1}`);
      if (!questionId) return null;
      return {
        question_id: questionId,
        canonical_key: question.suggestedCanonicalKey,
        mapping_type: question.mappingType,
        verification_status: "model_suggested",
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (mappingRows.length > 0) {
    const { error: mappingError } = await sb
      .from("smartprobonoip_field_mappings")
      .insert(mappingRows);
    if (mappingError) throw new Error(mappingError.message);
  }

  const view = await getOrganizationIntakeTemplate(
    input.organizationId,
    templateRow.id,
  );
  if (!view) throw new Error("Could not load imported template");
  return view;
}

export async function listOrganizationIntakeTemplates(
  organizationId: string,
): Promise<OrganizationIntakeTemplateListItem[]> {
  const sb = getSupabaseService();
  const { data: templates, error } = await sb
    .from("smartprobonoip_intake_templates")
    .select(
      "id, template_name, version, mapping_status, source_import_id, created_at, updated_at",
    )
    .eq("partner_organization_id", organizationId)
    .neq("mapping_status", "retired")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  if (!templates?.length) return [];

  const templateIds = templates.map((row) => row.id as string);
  const importIds = templates
    .map((row) => row.source_import_id as string | null)
    .filter((value): value is string => Boolean(value));

  const [{ data: questions, error: qError }, { data: imports, error: iError }] =
    await Promise.all([
      sb
        .from("smartprobonoip_intake_questions")
        .select("template_id, mapping_disposition")
        .in("template_id", templateIds),
      importIds.length
        ? sb
            .from("smartprobonoip_intake_imports")
            .select("id, source_filename, parser")
            .in("id", importIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (qError) throw new Error(qError.message);
  if (iError) throw new Error(iError.message);

  const importById = new Map(
    (imports ?? []).map((row) => [row.id as string, row]),
  );

  return templates.map((template) => {
    const rows = (questions ?? []).filter(
      (row) => row.template_id === template.id,
    );
    const importRow = template.source_import_id
      ? importById.get(template.source_import_id as string)
      : null;

    return {
      id: template.id as string,
      templateName: template.template_name as string,
      version: template.version as string,
      mappingStatus:
        template.mapping_status as OrganizationIntakeTemplateListItem["mappingStatus"],
      sourceFilename: (importRow?.source_filename as string | null) ?? null,
      parser: (importRow?.parser as string | null) ?? null,
      questionCount: rows.length,
      mappedCount: rows.filter((row) => row.mapping_disposition === "mapped")
        .length,
      firmOnlyCount: rows.filter(
        (row) => row.mapping_disposition === "firm_only",
      ).length,
      unreviewedCount: rows.filter(
        (row) => row.mapping_disposition === "unreviewed",
      ).length,
      createdAt: template.created_at as string,
      updatedAt: template.updated_at as string,
    };
  });
}

export async function getOrganizationIntakeTemplate(
  organizationId: string,
  templateId: string,
): Promise<OrganizationIntakeTemplateView | null> {
  const sb = getSupabaseService();
  const { data: template, error } = await sb
    .from("smartprobonoip_intake_templates")
    .select(
      "id, partner_organization_id, organization_name, template_name, version, mapping_status, source_import_id, created_at, updated_at",
    )
    .eq("id", templateId)
    .eq("partner_organization_id", organizationId)
    .maybeSingle();
  if (error || !template) return null;

  const [{ data: questions, error: qError }, { data: importRow, error: iError }] =
    await Promise.all([
      sb
        .from("smartprobonoip_intake_questions")
        .select(
          "id, section_name, question_text, answer_type, required_by_professional, display_order, mapping_disposition, mapping_notes",
        )
        .eq("template_id", templateId)
        .order("display_order", { ascending: true }),
      template.source_import_id
        ? sb
            .from("smartprobonoip_intake_imports")
            .select("id, source_mode, source_filename, parser")
            .eq("id", template.source_import_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
  if (qError) throw new Error(qError.message);
  if (iError) throw new Error(iError.message);

  const questionRows = (questions ?? []) as QuestionRow[];
  const questionIds = questionRows.map((row) => row.id);
  const { data: mappings, error: mError } = questionIds.length
    ? await sb
        .from("smartprobonoip_field_mappings")
        .select("question_id, canonical_key, verification_status")
        .in("question_id", questionIds)
    : { data: [], error: null };
  if (mError) throw new Error(mError.message);

  const mappingRows = (mappings ?? []) as MappingRow[];
  const questionViews: OrganizationIntakeQuestionView[] = questionRows.map(
    (question) => {
      const questionMappings = mappingRows.filter(
        (mapping) => mapping.question_id === question.id,
      );
      const verified = questionMappings.find(
        (mapping) => mapping.verification_status === "human_verified",
      );
      const suggested = questionMappings.find(
        (mapping) => mapping.verification_status === "model_suggested",
      );

      return {
        id: question.id,
        sectionName: question.section_name,
        questionText: question.question_text,
        answerType: question.answer_type,
        requiredByProfessional: question.required_by_professional,
        displayOrder: question.display_order,
        mappingDisposition: question.mapping_disposition,
        mappingNotes: question.mapping_notes,
        suggestedCanonicalKey: suggested?.canonical_key ?? null,
        suggestedCanonicalLabel: suggested
          ? canonicalFieldLabel(suggested.canonical_key)
          : null,
        verifiedCanonicalKey: verified?.canonical_key ?? null,
        verifiedCanonicalLabel: verified
          ? canonicalFieldLabel(verified.canonical_key)
          : null,
      };
    },
  );

  const listItem = (await listOrganizationIntakeTemplates(organizationId)).find(
    (row) => row.id === templateId,
  );

  return {
    id: template.id as string,
    templateName: template.template_name as string,
    version: template.version as string,
    mappingStatus:
      template.mapping_status as OrganizationIntakeTemplateView["mappingStatus"],
    organizationName: (template.organization_name as string | null) ?? null,
    sourceFilename: listItem?.sourceFilename ?? null,
    parser: listItem?.parser ?? null,
    questionCount: questionViews.length,
    mappedCount: questionViews.filter(
      (question) => question.mappingDisposition === "mapped",
    ).length,
    firmOnlyCount: questionViews.filter(
      (question) => question.mappingDisposition === "firm_only",
    ).length,
    unreviewedCount: questionViews.filter(
      (question) => question.mappingDisposition === "unreviewed",
    ).length,
    createdAt: template.created_at as string,
    updatedAt: template.updated_at as string,
    importId: (template.source_import_id as string | null) ?? null,
    sourceMode: (importRow?.source_mode as string | null) ?? null,
    questions: questionViews,
  };
}

export async function reviewOrganizationIntakeQuestion(input: {
  organizationId: string;
  actorEmail: string;
  templateId: string;
  questionId: string;
  disposition: "mapped" | "firm_only";
  canonicalKey?: string | null;
  mappingNotes?: string | null;
}): Promise<OrganizationIntakeTemplateView> {
  const sb = getSupabaseService();
  const current = await getOrganizationIntakeTemplate(
    input.organizationId,
    input.templateId,
  );
  if (!current) throw new Error("Intake template not found");
  if (!current.questions.some((question) => question.id === input.questionId)) {
    throw new Error("Intake question not found");
  }

  if (
    input.disposition === "mapped" &&
    !isCanonicalIntakeFieldKey(input.canonicalKey)
  ) {
    throw new Error("Select a canonical field or mark the question firm-only");
  }

  const { error: deleteError } = await sb
    .from("smartprobonoip_field_mappings")
    .delete()
    .eq("question_id", input.questionId);
  if (deleteError) throw new Error(deleteError.message);

  if (input.disposition === "mapped" && input.canonicalKey) {
    const { error: insertError } = await sb
      .from("smartprobonoip_field_mappings")
      .insert({
        question_id: input.questionId,
        canonical_key: input.canonicalKey,
        mapping_type: input.canonicalKey.endsWith(".collection")
          ? "composite"
          : "direct",
        verification_status: "human_verified",
        verified_by: input.actorEmail,
        verified_at: new Date().toISOString(),
      });
    if (insertError) throw new Error(insertError.message);
  }

  const { error: questionError } = await sb
    .from("smartprobonoip_intake_questions")
    .update({
      mapping_disposition: input.disposition,
      mapping_notes: input.mappingNotes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.questionId)
    .eq("template_id", input.templateId);
  if (questionError) throw new Error(questionError.message);

  await recalcTemplateStatus(input.templateId);
  const updated = await getOrganizationIntakeTemplate(
    input.organizationId,
    input.templateId,
  );
  if (!updated) throw new Error("Could not reload intake template");
  return updated;
}

export async function retireOrganizationIntakeTemplate(input: {
  organizationId: string;
  templateId: string;
}): Promise<boolean> {
  const sb = getSupabaseService();
  const { error } = await sb
    .from("smartprobonoip_intake_templates")
    .update({
      mapping_status: "retired",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.templateId)
    .eq("partner_organization_id", input.organizationId);
  return !error;
}
