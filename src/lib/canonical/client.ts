"use client";

import { pilotSessionHeaders } from "@/lib/pilotSession";
import type {
  CanonicalContributor,
  CanonicalDisclosureRecord,
  CanonicalEvidenceFile,
  ProfessionalHandoffSession,
  ProfessionalHandoffTemplateOption,
} from "@/lib/types";

async function readError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return body.error ?? "Request failed";
}

export async function loadContributors(projectId: string): Promise<CanonicalContributor[]> {
  const res = await fetch(`/api/records/${projectId}/contributors`, {
    headers: pilotSessionHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { contributors: CanonicalContributor[] };
  return data.contributors;
}

export async function saveContributor(
  projectId: string,
  input: Partial<CanonicalContributor> & {
    action: "create" | "update";
    contributorId?: string;
  },
): Promise<CanonicalContributor> {
  const res = await fetch(`/api/records/${projectId}/contributors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { contributor: CanonicalContributor };
  return data.contributor;
}

export async function removeContributor(projectId: string, contributorId: string): Promise<void> {
  const res = await fetch(`/api/records/${projectId}/contributors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify({ action: "delete", contributorId }),
  });
  if (!res.ok) throw new Error(await readError(res));
}

export async function loadDisclosures(projectId: string): Promise<CanonicalDisclosureRecord[]> {
  const res = await fetch(`/api/records/${projectId}/disclosures`, {
    headers: pilotSessionHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { disclosures: CanonicalDisclosureRecord[] };
  return data.disclosures;
}

export async function saveDisclosure(
  projectId: string,
  input: Partial<CanonicalDisclosureRecord> & {
    action: "create" | "update";
    disclosureId?: string;
  },
): Promise<CanonicalDisclosureRecord> {
  const res = await fetch(`/api/records/${projectId}/disclosures`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { disclosure: CanonicalDisclosureRecord };
  return data.disclosure;
}

export async function removeDisclosure(projectId: string, disclosureId: string): Promise<void> {
  const res = await fetch(`/api/records/${projectId}/disclosures`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify({ action: "delete", disclosureId }),
  });
  if (!res.ok) throw new Error(await readError(res));
}

export async function loadEvidence(projectId: string): Promise<CanonicalEvidenceFile[]> {
  const res = await fetch(`/api/records/${projectId}/evidence`, {
    headers: pilotSessionHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { evidence: CanonicalEvidenceFile[] };
  return data.evidence;
}

export async function uploadEvidence(
  projectId: string,
  input: {
    file: File;
    evidenceType: CanonicalEvidenceFile["evidenceType"];
    documentDate?: string;
    description?: string;
  },
): Promise<CanonicalEvidenceFile> {
  const form = new FormData();
  form.set("file", input.file);
  form.set("evidenceType", input.evidenceType);
  if (input.documentDate) form.set("documentDate", input.documentDate);
  if (input.description) form.set("description", input.description);

  const res = await fetch(`/api/records/${projectId}/evidence`, {
    method: "POST",
    headers: pilotSessionHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { evidence: CanonicalEvidenceFile };
  return data.evidence;
}

export async function openEvidence(projectId: string, evidenceId: string): Promise<void> {
  const res = await fetch(
    `/api/records/${projectId}/evidence?file=${encodeURIComponent(evidenceId)}`,
    { headers: pilotSessionHeaders() },
  );
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { url: string };
  window.open(data.url, "_blank", "noopener,noreferrer");
}

export async function removeEvidence(projectId: string, evidenceId: string): Promise<void> {
  const res = await fetch(
    `/api/records/${projectId}/evidence?file=${encodeURIComponent(evidenceId)}`,
    {
      method: "DELETE",
      headers: pilotSessionHeaders(),
    },
  );
  if (!res.ok) throw new Error(await readError(res));
}

export async function loadProfessionalHandoff(
  projectId: string,
): Promise<{
  handoff: ProfessionalHandoffSession | null;
  templates: ProfessionalHandoffTemplateOption[];
}> {
  const res = await fetch(`/api/records/${projectId}/professional-handoff`, {
    headers: pilotSessionHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as {
    handoff: ProfessionalHandoffSession | null;
    templates: ProfessionalHandoffTemplateOption[];
  };
}

export async function prepareProfessionalHandoff(
  projectId: string,
  templateId?: string | null,
): Promise<ProfessionalHandoffSession> {
  const res = await fetch(`/api/records/${projectId}/professional-handoff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify({ action: "prepare", templateId: templateId ?? null }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { handoff: ProfessionalHandoffSession };
  return data.handoff;
}

export async function answerProfessionalHandoffQuestion(
  projectId: string,
  sessionId: string,
  questionId: string,
  value: string,
): Promise<ProfessionalHandoffSession> {
  const res = await fetch(`/api/records/${projectId}/professional-handoff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify({ action: "answer", sessionId, questionId, value }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { handoff: ProfessionalHandoffSession };
  return data.handoff;
}

export async function approveMappedProfessionalHandoff(
  projectId: string,
  sessionId: string,
): Promise<ProfessionalHandoffSession> {
  const res = await fetch(`/api/records/${projectId}/professional-handoff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...pilotSessionHeaders(),
    },
    body: JSON.stringify({ action: "approve_mapped", sessionId }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { handoff: ProfessionalHandoffSession };
  return data.handoff;
}
