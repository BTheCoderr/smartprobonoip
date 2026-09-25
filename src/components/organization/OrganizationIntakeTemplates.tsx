"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  CANONICAL_INTAKE_FIELDS,
  canonicalFieldLabel,
} from "@/lib/handoff/canonicalFields";
import { ROUTES } from "@/lib/routes";

type TemplateStatus = "draft" | "partially_verified" | "verified" | "retired";
type MappingDisposition = "unreviewed" | "mapped" | "firm_only";

interface TemplateListItem {
  id: string;
  templateName: string;
  version: string;
  mappingStatus: TemplateStatus;
  sourceFilename: string | null;
  parser: string | null;
  questionCount: number;
  mappedCount: number;
  firmOnlyCount: number;
  unreviewedCount: number;
  createdAt: string;
  updatedAt: string;
}

interface QuestionView {
  id: string;
  sectionName: string | null;
  questionText: string;
  answerType: string;
  requiredByProfessional: boolean;
  displayOrder: number | null;
  mappingDisposition: MappingDisposition;
  mappingNotes: string | null;
  suggestedCanonicalKey: string | null;
  suggestedCanonicalLabel: string | null;
  verifiedCanonicalKey: string | null;
  verifiedCanonicalLabel: string | null;
}

interface TemplateView extends TemplateListItem {
  organizationName: string | null;
  importId: string | null;
  sourceMode: string | null;
  questions: QuestionView[];
}

async function readApiError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? "Request failed";
}

function statusLabel(status: TemplateStatus): string {
  return status.replaceAll("_", " ");
}

function parserLabel(parser: string | null): string {
  if (parser === "ai") return "AI-assisted extraction";
  if (parser === "rule_fallback") return "Rule fallback";
  if (parser === "rule") return "Rule extraction";
  return "Manual";
}

export function OrganizationIntakeTemplates() {
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [selected, setSelected] = useState<TemplateView | null>(null);
  const [importName, setImportName] = useState("");
  const [rawText, setRawText] = useState("");
  const [sourceMode, setSourceMode] = useState<"paste" | "text_file">("paste");
  const [sourceFilename, setSourceFilename] = useState<string | null>(null);
  const [mappingDrafts, setMappingDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadTemplates(selectId?: string) {
    const res = await fetch("/api/organization/intakes");
    if (res.status === 401 || res.status === 403) {
      window.location.href = ROUTES.organizationLogin;
      return;
    }
    if (!res.ok) throw new Error(await readApiError(res));
    const data = (await res.json()) as { templates: TemplateListItem[] };
    setTemplates(data.templates ?? []);

    const targetId = selectId ?? selected?.id;
    if (targetId) {
      await loadTemplate(targetId);
    }
  }

  async function loadTemplate(id: string) {
    const res = await fetch(`/api/organization/intakes/${id}`);
    if (!res.ok) throw new Error(await readApiError(res));
    const data = (await res.json()) as { template: TemplateView };
    setSelected(data.template);
    const drafts: Record<string, string> = {};
    for (const question of data.template.questions) {
      drafts[question.id] =
        question.verifiedCanonicalKey ??
        question.suggestedCanonicalKey ??
        "";
    }
    setMappingDrafts(drafts);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/organization/intakes")
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = ROUTES.organizationLogin;
          return null;
        }
        if (!res.ok) throw new Error(await readApiError(res));
        return res.json();
      })
      .then((data: { templates?: TemplateListItem[] } | null) => {
        if (!active || !data) return;
        setTemplates(data.templates ?? []);
      })
      .catch((err) => {
        if (active) {
          setMessage(err instanceof Error ? err.message : "Could not load intake forms.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedSummary = useMemo(() => {
    if (!selected) return null;
    const reviewed = selected.mappedCount + selected.firmOnlyCount;
    return {
      reviewed,
      total: selected.questionCount,
      pct:
        selected.questionCount > 0
          ? Math.round((reviewed / selected.questionCount) * 100)
          : 0,
    };
  }, [selected]);

  async function importIntake(event: React.FormEvent) {
    event.preventDefault();
    setWorking(true);
    setMessage(null);
    try {
      const res = await fetch("/api/organization/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          importName,
          rawText,
          sourceMode,
          sourceFilename,
        }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      const data = (await res.json()) as { template: TemplateView };
      setSelected(data.template);
      setImportName("");
      setRawText("");
      setSourceMode("paste");
      setSourceFilename(null);
      setMappingDrafts(
        Object.fromEntries(
          data.template.questions.map((q) => [
            q.id,
            q.suggestedCanonicalKey ?? "",
          ]),
        ),
      );
      await loadTemplates(data.template.id);
      setMessage(
        `Imported ${data.template.questionCount} questions. Review every mapping before the template becomes verified.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not import this intake.");
    } finally {
      setWorking(false);
    }
  }

  async function reviewQuestion(
    questionId: string,
    disposition: "mapped" | "firm_only",
  ) {
    if (!selected) return;
    setWorking(true);
    setMessage(null);
    try {
      const canonicalKey =
        disposition === "mapped" ? mappingDrafts[questionId] || null : null;
      const res = await fetch(`/api/organization/intakes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_mapping",
          questionId,
          disposition,
          canonicalKey,
        }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      const data = (await res.json()) as { template: TemplateView };
      setSelected(data.template);
      setTemplates((current) =>
        current.map((item) =>
          item.id === data.template.id
            ? {
                ...item,
                mappingStatus: data.template.mappingStatus,
                mappedCount: data.template.mappedCount,
                firmOnlyCount: data.template.firmOnlyCount,
                unreviewedCount: data.template.unreviewedCount,
                updatedAt: data.template.updatedAt,
              }
            : item,
        ),
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save mapping.");
    } finally {
      setWorking(false);
    }
  }

  async function retireSelected() {
    if (!selected) return;
    if (!window.confirm("Retire this intake template? Existing handoffs remain unchanged.")) {
      return;
    }
    setWorking(true);
    try {
      const res = await fetch(`/api/organization/intakes/${selected.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await readApiError(res));
      setSelected(null);
      await loadTemplates();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not retire intake.");
    } finally {
      setWorking(false);
    }
  }

  function onTextFile(file: File | null) {
    if (!file) return;
    const allowed = [".txt", ".md", ".csv"];
    const lower = file.name.toLowerCase();
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      setMessage(
        "For this importer, upload a TXT, Markdown, or CSV text export, or paste the questionnaire text. PDF/DOCX source files are not silently guessed.",
      );
      return;
    }
    file
      .text()
      .then((text) => {
        setRawText(text);
        setSourceMode("text_file");
        setSourceFilename(file.name);
        if (!importName.trim()) {
          setImportName(file.name.replace(/\.[^.]+$/, ""));
        }
        setMessage(null);
      })
      .catch(() => setMessage("Could not read that text file."));
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader
          title="Professional intake forms"
          subtitle="Keep your organization's own questionnaire. SmartProBonoIP extracts the questions, suggests reusable factual mappings, and requires a human to verify each mapping."
        />

        <form onSubmit={importIntake} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-navy-800">
            Intake name
            <input
              className="input-surface mt-1"
              placeholder="Example: New invention intake — 2026"
              value={importName}
              onChange={(e) => setImportName(e.target.value)}
            />
          </label>

          <div className="rounded-xl border border-dashed border-mist-300 bg-mist-50/50 p-4">
            <label className="block text-sm font-medium text-navy-800">
              Load a text export
              <input
                type="file"
                accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
                className="mt-2 block w-full text-sm text-navy-600"
                onChange={(e) => onTextFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="mt-2 text-xs leading-relaxed text-navy-500">
              TXT, Markdown, and CSV are parsed directly. For PDF/DOCX in this
              version, copy or export the questionnaire text first so the system
              never pretends it extracted wording it could not read.
            </p>
          </div>

          <label className="block text-sm font-medium text-navy-800">
            Questionnaire text
            <textarea
              rows={12}
              className="input-surface mt-1 font-mono text-xs"
              placeholder={"INVENTION\n1. What is the title of the invention?\n2. Describe the invention in detail..."}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setSourceMode("paste");
                setSourceFilename(null);
              }}
            />
          </label>

          <button
            type="submit"
            className="btn-primary"
            disabled={working || !importName.trim() || !rawText.trim()}
          >
            {working ? "Importing…" : "Import and suggest mappings"}
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-navy-700">
            {message}
          </p>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Saved firm intakes"
            subtitle="Each form stays separate and can have its own verified mapping."
          />
          {loading ? (
            <p className="text-sm text-navy-500">Loading…</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-navy-500">No organization intake forms yet.</p>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => void loadTemplate(template.id)}
                  className={
                    "w-full rounded-xl border px-3 py-3 text-left transition " +
                    (selected?.id === template.id
                      ? "border-teal-300 bg-teal-50"
                      : "border-mist-200 bg-white hover:border-teal-200")
                  }
                >
                  <p className="font-medium text-navy-900">{template.templateName}</p>
                  <p className="mt-1 text-xs text-navy-500">
                    {template.questionCount} questions · {statusLabel(template.mappingStatus)}
                  </p>
                  <p className="mt-1 text-[11px] text-navy-400">
                    {template.sourceFilename
                      ? template.sourceFilename + " · "
                      : ""}
                    {parserLabel(template.parser)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>

        {selected ? (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardHeader
                title={selected.templateName}
                subtitle="Suggested mappings are not trusted until a person from the organization confirms them. Questions that do not correspond to reusable facts stay firm-only."
              />
              <button
                type="button"
                className="btn-ghost text-xs"
                disabled={working}
                onClick={() => void retireSelected()}
              >
                Retire template
              </button>
            </div>

            {selectedSummary ? (
              <div className="mb-5 rounded-xl border border-mist-200 bg-mist-50/60 p-4">
                <div className="flex flex-wrap gap-4 text-sm text-navy-700">
                  <span>
                    <strong>{selectedSummary.reviewed}</strong>/{selectedSummary.total} reviewed
                  </span>
                  <span>
                    <strong>{selected.mappedCount}</strong> mapped
                  </span>
                  <span>
                    <strong>{selected.firmOnlyCount}</strong> firm-only
                  </span>
                  <span>
                    <strong>{selected.unreviewedCount}</strong> unreviewed
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist-200">
                  <div
                    className="h-full bg-teal-500"
                    style={{ width: selectedSummary.pct + "%" }}
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-4">
              {selected.questions.map((question) => {
                const selectedKey = mappingDrafts[question.id] ?? "";
                return (
                  <div
                    key={question.id}
                    className="rounded-xl border border-mist-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        {question.sectionName ? (
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                            {question.sectionName}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-navy-900">
                          {question.questionText}
                          {question.requiredByProfessional ? " *" : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-mist-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-navy-500">
                        {question.mappingDisposition.replaceAll("_", " ")}
                      </span>
                    </div>

                    {question.suggestedCanonicalKey &&
                    question.mappingDisposition === "unreviewed" ? (
                      <p className="mt-3 text-xs text-teal-700">
                        Suggested: {question.suggestedCanonicalLabel}
                      </p>
                    ) : null}

                    <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                      <label className="text-xs font-medium text-navy-600">
                        Canonical factual field
                        <select
                          className="input-surface mt-1"
                          value={selectedKey}
                          onChange={(e) =>
                            setMappingDrafts((current) => ({
                              ...current,
                              [question.id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Choose a field…</option>
                          {CANONICAL_INTAKE_FIELDS.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="btn-secondary self-end text-xs"
                        disabled={working || !selectedKey}
                        onClick={() => void reviewQuestion(question.id, "mapped")}
                      >
                        Confirm mapping
                      </button>
                      <button
                        type="button"
                        className="btn-ghost self-end text-xs"
                        disabled={working}
                        onClick={() => void reviewQuestion(question.id, "firm_only")}
                      >
                        Firm-only
                      </button>
                    </div>

                    {question.verifiedCanonicalKey ? (
                      <p className="mt-2 text-xs text-navy-500">
                        Verified mapping:{" "}
                        <strong>{canonicalFieldLabel(question.verifiedCanonicalKey)}</strong>
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-navy-500">
              Import or select a form to review its question mappings.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
