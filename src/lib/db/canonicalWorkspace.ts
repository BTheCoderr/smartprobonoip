import "server-only";

import { getSupabaseService } from "@/lib/supabaseServer";
import type {
  CanonicalContributor,
  CanonicalDisclosureRecord,
  CanonicalEvidenceFile,
} from "@/lib/types";

const EVIDENCE_BUCKET = "smartprobonoip-evidence";

interface ContributorRow {
  id: string;
  legal_first_name: string | null;
  legal_middle_name: string | null;
  legal_last_name: string | null;
  email: string | null;
  phone: string | null;
  employer_affiliation: string | null;
  position_department: string | null;
  other_affiliations: string | null;
  contribution_description: string | null;
  contribution_started_on: string | null;
  contribution_ended_on: string | null;
  user_identified_role: CanonicalContributor["userIdentifiedRole"] | null;
  residence_city: string | null;
  residence_region: string | null;
  residence_country: string | null;
  is_primary_contact: boolean;
  created_at: string;
  updated_at: string;
}

interface DisclosureRow {
  id: string;
  event_type: CanonicalDisclosureRecord["eventType"];
  event_date: string | null;
  date_precision: CanonicalDisclosureRecord["datePrecision"];
  anticipated: boolean;
  what_was_shared: string | null;
  audience_description: string | null;
  access_scope: CanonicalDisclosureRecord["accessScope"];
  confidentiality_basis: CanonicalDisclosureRecord["confidentialityBasis"];
  location_or_channel: string | null;
  reference_title: string | null;
  submission_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface EvidenceRow {
  id: string;
  storage_bucket: string;
  storage_path: string;
  original_filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  evidence_type: CanonicalEvidenceFile["evidenceType"] | null;
  document_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function contributorFromRow(row: ContributorRow): CanonicalContributor {
  return {
    id: row.id,
    legalFirstName: row.legal_first_name ?? "",
    legalMiddleName: row.legal_middle_name,
    legalLastName: row.legal_last_name ?? "",
    email: row.email,
    phone: row.phone,
    employerAffiliation: row.employer_affiliation,
    positionDepartment: row.position_department,
    otherAffiliations: row.other_affiliations,
    contributionDescription: row.contribution_description,
    contributionStartedOn: row.contribution_started_on,
    contributionEndedOn: row.contribution_ended_on,
    userIdentifiedRole: row.user_identified_role ?? "unknown",
    residenceCity: row.residence_city,
    residenceRegion: row.residence_region,
    residenceCountry: row.residence_country,
    isPrimaryContact: row.is_primary_contact,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function disclosureFromRow(row: DisclosureRow): CanonicalDisclosureRecord {
  return {
    id: row.id,
    eventType: row.event_type,
    eventDate: row.event_date,
    datePrecision: row.date_precision,
    anticipated: row.anticipated,
    whatWasShared: row.what_was_shared,
    audienceDescription: row.audience_description,
    accessScope: row.access_scope,
    confidentialityBasis: row.confidentiality_basis,
    locationOrChannel: row.location_or_channel,
    referenceTitle: row.reference_title,
    submissionDate: row.submission_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function evidenceFromRow(row: EvidenceRow): CanonicalEvidenceFile {
  return {
    id: row.id,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    evidenceType: row.evidence_type ?? "other",
    documentDate: row.document_date,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listContributors(projectId: string): Promise<CanonicalContributor[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_contributors")
    .select("*")
    .eq("project_id", projectId)
    .order("is_primary_contact", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ContributorRow[]).map(contributorFromRow);
}

export async function createContributor(input: {
  projectId: string;
  pilotSessionId: string;
  legalFirstName: string;
  legalMiddleName?: string | null;
  legalLastName: string;
  email?: string | null;
  phone?: string | null;
  employerAffiliation?: string | null;
  positionDepartment?: string | null;
  otherAffiliations?: string | null;
  contributionDescription?: string | null;
  contributionStartedOn?: string | null;
  contributionEndedOn?: string | null;
  userIdentifiedRole?: CanonicalContributor["userIdentifiedRole"];
  residenceCity?: string | null;
  residenceRegion?: string | null;
  residenceCountry?: string | null;
  isPrimaryContact?: boolean;
}): Promise<CanonicalContributor> {
  const sb = getSupabaseService();
  if (input.isPrimaryContact) {
    await sb
      .from("smartprobonoip_contributors")
      .update({ is_primary_contact: false, updated_at: new Date().toISOString() })
      .eq("project_id", input.projectId);
  }

  const { data, error } = await sb
    .from("smartprobonoip_contributors")
    .insert({
      project_id: input.projectId,
      pilot_session_id: input.pilotSessionId,
      legal_first_name: input.legalFirstName.trim(),
      legal_middle_name: input.legalMiddleName?.trim() || null,
      legal_last_name: input.legalLastName.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      employer_affiliation: input.employerAffiliation?.trim() || null,
      position_department: input.positionDepartment?.trim() || null,
      other_affiliations: input.otherAffiliations?.trim() || null,
      contribution_description: input.contributionDescription?.trim() || null,
      contribution_started_on: input.contributionStartedOn || null,
      contribution_ended_on: input.contributionEndedOn || null,
      user_identified_role: input.userIdentifiedRole ?? "unknown",
      residence_city: input.residenceCity?.trim() || null,
      residence_region: input.residenceRegion?.trim() || null,
      residence_country: input.residenceCountry?.trim() || null,
      is_primary_contact: input.isPrimaryContact ?? false,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not add contributor");
  return contributorFromRow(data as ContributorRow);
}

export async function updateContributor(
  projectId: string,
  contributorId: string,
  input: Partial<Omit<Parameters<typeof createContributor>[0], "projectId" | "pilotSessionId">>,
): Promise<CanonicalContributor> {
  const sb = getSupabaseService();
  if (input.isPrimaryContact) {
    await sb
      .from("smartprobonoip_contributors")
      .update({ is_primary_contact: false, updated_at: new Date().toISOString() })
      .eq("project_id", projectId);
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.legalFirstName !== undefined) patch.legal_first_name = input.legalFirstName.trim();
  if (input.legalMiddleName !== undefined) patch.legal_middle_name = input.legalMiddleName?.trim() || null;
  if (input.legalLastName !== undefined) patch.legal_last_name = input.legalLastName.trim();
  if (input.email !== undefined) patch.email = input.email?.trim() || null;
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null;
  if (input.employerAffiliation !== undefined) patch.employer_affiliation = input.employerAffiliation?.trim() || null;
  if (input.positionDepartment !== undefined) patch.position_department = input.positionDepartment?.trim() || null;
  if (input.otherAffiliations !== undefined) patch.other_affiliations = input.otherAffiliations?.trim() || null;
  if (input.contributionDescription !== undefined) patch.contribution_description = input.contributionDescription?.trim() || null;
  if (input.contributionStartedOn !== undefined) patch.contribution_started_on = input.contributionStartedOn || null;
  if (input.contributionEndedOn !== undefined) patch.contribution_ended_on = input.contributionEndedOn || null;
  if (input.userIdentifiedRole !== undefined) patch.user_identified_role = input.userIdentifiedRole;
  if (input.residenceCity !== undefined) patch.residence_city = input.residenceCity?.trim() || null;
  if (input.residenceRegion !== undefined) patch.residence_region = input.residenceRegion?.trim() || null;
  if (input.residenceCountry !== undefined) patch.residence_country = input.residenceCountry?.trim() || null;
  if (input.isPrimaryContact !== undefined) patch.is_primary_contact = input.isPrimaryContact;

  const { data, error } = await sb
    .from("smartprobonoip_contributors")
    .update(patch)
    .eq("project_id", projectId)
    .eq("id", contributorId)
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not update contributor");
  return contributorFromRow(data as ContributorRow);
}

export async function deleteContributor(projectId: string, contributorId: string): Promise<void> {
  const sb = getSupabaseService();
  const { error } = await sb
    .from("smartprobonoip_contributors")
    .delete()
    .eq("project_id", projectId)
    .eq("id", contributorId);
  if (error) throw new Error(error.message);
}

export async function listDisclosureEvents(projectId: string): Promise<CanonicalDisclosureRecord[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_disclosure_events")
    .select("*")
    .eq("project_id", projectId)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as DisclosureRow[]).map(disclosureFromRow);
}

export async function createDisclosureEvent(input: {
  projectId: string;
  pilotSessionId: string;
  eventType: CanonicalDisclosureRecord["eventType"];
  eventDate?: string | null;
  datePrecision?: CanonicalDisclosureRecord["datePrecision"];
  anticipated?: boolean;
  whatWasShared?: string | null;
  audienceDescription?: string | null;
  accessScope?: CanonicalDisclosureRecord["accessScope"];
  confidentialityBasis?: CanonicalDisclosureRecord["confidentialityBasis"];
  locationOrChannel?: string | null;
  referenceTitle?: string | null;
  submissionDate?: string | null;
  notes?: string | null;
}): Promise<CanonicalDisclosureRecord> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_disclosure_events")
    .insert({
      project_id: input.projectId,
      pilot_session_id: input.pilotSessionId,
      event_type: input.eventType,
      event_date: input.eventDate || null,
      date_precision: input.datePrecision ?? (input.eventDate ? "exact" : "unknown"),
      anticipated: input.anticipated ?? false,
      what_was_shared: input.whatWasShared?.trim() || null,
      audience_description: input.audienceDescription?.trim() || null,
      access_scope: input.accessScope ?? "unknown",
      confidentiality_basis: input.confidentialityBasis ?? "unknown",
      location_or_channel: input.locationOrChannel?.trim() || null,
      reference_title: input.referenceTitle?.trim() || null,
      submission_date: input.submissionDate || null,
      notes: input.notes?.trim() || null,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not add disclosure event");
  return disclosureFromRow(data as DisclosureRow);
}

export async function updateDisclosureEvent(
  projectId: string,
  disclosureId: string,
  input: Partial<Omit<Parameters<typeof createDisclosureEvent>[0], "projectId" | "pilotSessionId">>,
): Promise<CanonicalDisclosureRecord> {
  const sb = getSupabaseService();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.eventType !== undefined) patch.event_type = input.eventType;
  if (input.eventDate !== undefined) patch.event_date = input.eventDate || null;
  if (input.datePrecision !== undefined) patch.date_precision = input.datePrecision;
  if (input.anticipated !== undefined) patch.anticipated = input.anticipated;
  if (input.whatWasShared !== undefined) patch.what_was_shared = input.whatWasShared?.trim() || null;
  if (input.audienceDescription !== undefined) patch.audience_description = input.audienceDescription?.trim() || null;
  if (input.accessScope !== undefined) patch.access_scope = input.accessScope;
  if (input.confidentialityBasis !== undefined) patch.confidentiality_basis = input.confidentialityBasis;
  if (input.locationOrChannel !== undefined) patch.location_or_channel = input.locationOrChannel?.trim() || null;
  if (input.referenceTitle !== undefined) patch.reference_title = input.referenceTitle?.trim() || null;
  if (input.submissionDate !== undefined) patch.submission_date = input.submissionDate || null;
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;

  const { data, error } = await sb
    .from("smartprobonoip_disclosure_events")
    .update(patch)
    .eq("project_id", projectId)
    .eq("id", disclosureId)
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not update disclosure event");
  return disclosureFromRow(data as DisclosureRow);
}

export async function deleteDisclosureEvent(projectId: string, disclosureId: string): Promise<void> {
  const sb = getSupabaseService();
  const { error } = await sb
    .from("smartprobonoip_disclosure_events")
    .delete()
    .eq("project_id", projectId)
    .eq("id", disclosureId);
  if (error) throw new Error(error.message);
}

export async function listEvidenceFiles(projectId: string): Promise<CanonicalEvidenceFile[]> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_evidence_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as EvidenceRow[]).map(evidenceFromRow);
}

function safeFilename(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned.slice(0, 120) || "evidence-file";
}

export async function createEvidenceFile(input: {
  projectId: string;
  pilotSessionId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  bytes: Uint8Array;
  evidenceType: CanonicalEvidenceFile["evidenceType"];
  documentDate?: string | null;
  description?: string | null;
}): Promise<CanonicalEvidenceFile> {
  const sb = getSupabaseService();
  const path = `${input.projectId}/${crypto.randomUUID()}-${safeFilename(input.originalFilename)}`;

  const { error: uploadError } = await sb.storage
    .from(EVIDENCE_BUCKET)
    .upload(path, input.bytes, {
      contentType: input.mimeType,
      upsert: false,
    });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await sb
    .from("smartprobonoip_evidence_files")
    .insert({
      project_id: input.projectId,
      pilot_session_id: input.pilotSessionId,
      storage_bucket: EVIDENCE_BUCKET,
      storage_path: path,
      original_filename: input.originalFilename,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      evidence_type: input.evidenceType,
      document_date: input.documentDate || null,
      description: input.description?.trim() || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    await sb.storage.from(EVIDENCE_BUCKET).remove([path]);
    throw new Error(error?.message ?? "Could not save evidence metadata");
  }

  return evidenceFromRow(data as EvidenceRow);
}

export async function createEvidenceDownloadUrl(
  projectId: string,
  evidenceId: string,
): Promise<{ url: string; filename: string } | null> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_evidence_files")
    .select("storage_bucket, storage_path, original_filename")
    .eq("project_id", projectId)
    .eq("id", evidenceId)
    .maybeSingle();
  if (error || !data) return null;

  const signed = await sb.storage
    .from(data.storage_bucket as string)
    .createSignedUrl(data.storage_path as string, 120, {
      download: data.original_filename as string,
    });
  if (signed.error || !signed.data?.signedUrl) return null;
  return {
    url: signed.data.signedUrl,
    filename: data.original_filename as string,
  };
}

export async function deleteEvidenceFile(projectId: string, evidenceId: string): Promise<void> {
  const sb = getSupabaseService();
  const { data, error } = await sb
    .from("smartprobonoip_evidence_files")
    .select("storage_bucket, storage_path")
    .eq("project_id", projectId)
    .eq("id", evidenceId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return;

  const { error: storageError } = await sb.storage
    .from(data.storage_bucket as string)
    .remove([data.storage_path as string]);
  if (storageError) throw new Error(storageError.message);

  const { error: deleteError } = await sb
    .from("smartprobonoip_evidence_files")
    .delete()
    .eq("project_id", projectId)
    .eq("id", evidenceId);
  if (deleteError) throw new Error(deleteError.message);
}
