"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  answerProfessionalHandoffQuestion,
  approveMappedProfessionalHandoff,
  loadProfessionalHandoff,
  prepareProfessionalHandoff,
  shareProfessionalHandoff,
} from "@/lib/canonical/client";
import type {
  ProfessionalHandoffAnswer,
  ProfessionalHandoffSession,
  ProfessionalHandoffTemplateOption,
} from "@/lib/types";

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join("\n");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function answerTone(answer: ProfessionalHandoffAnswer): string {
  if (answer.resolutionMethod === "unresolved") {
    return "border-amber-200 bg-amber-50/50";
  }
  if (answer.userApprovedAt) {
    return "border-teal-200 bg-teal-50/40";
  }
  return "border-mist-200 bg-white";
}

export function ProfessionalIntakeMapperCard({ projectId }: { projectId: string }) {
  const [handoff, setHandoff] = useState<ProfessionalHandoffSession | null>(null);
  const [templates, setTemplates] = useState<ProfessionalHandoffTemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [working, setWorking] = useState(false);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadProfessionalHandoff(projectId)
      .then((next) => {
        if (!active) return;
        setHandoff(next.handoff);
        setTemplates(next.templates);
        setSelectedTemplateId(
          next.handoff?.templateId ?? next.templates[0]?.id ?? "",
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [projectId]);

  async function prepare() {
    setWorking(true);
    setError(null);
    try {
      setHandoff(
        await prepareProfessionalHandoff(
          projectId,
          selectedTemplateId || null,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare professional intake.");
    } finally {
      setWorking(false);
    }
  }

  async function saveUnresolvedAnswer(questionId: string) {
    if (!handoff) return;
    const value = draftAnswers[questionId]?.trim();
    if (!value) {
      setError("Enter an answer before saving.");
      return;
    }
    setWorking(true);
    setError(null);
    try {
      setHandoff(
        await answerProfessionalHandoffQuestion(
          projectId,
          handoff.id,
          questionId,
          value,
        ),
      );
      setDraftAnswers((current) => {
        const next = { ...current };
        delete next[questionId];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this answer.");
    } finally {
      setWorking(false);
    }
  }

  async function shareWithOrganization() {
    if (!handoff) return;
    setWorking(true);
    setError(null);
    try {
      setHandoff(await shareProfessionalHandoff(projectId, handoff.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not share this intake.");
    } finally {
      setWorking(false);
    }
  }

  async function approveMapped() {
    if (!handoff) return;
    setWorking(true);
    setError(null);
    try {
      setHandoff(await approveMappedProfessionalHandoff(projectId, handoff.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve mapped answers.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <Card className="border-navy-200">
      <CardHeader
        title="Professional intake mapper"
        subtitle="Maps reusable facts from your SmartProBonoIP record into a professional-style intake draft. The receiving professional's own intake remains authoritative."
      />

      {templates.length > 0 ? (
        <div className="mb-5 rounded-xl border border-mist-200 bg-mist-50/50 p-4">
          <label className="block text-sm font-medium text-navy-800">
            Intake to prepare
            <select
              className="input-surface mt-1"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.isGeneric
                    ? "SmartProBono core intake"
                    : (template.organizationName ?? "Professional organization") +
                      " — " +
                      template.templateName}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs leading-relaxed text-navy-500">
            Organization-specific forms appear only after you have chosen to share a
            referral with that organization and the organization has verified its
            question mappings.
          </p>
        </div>
      ) : null}

      {!handoff ? (
        <div>
          <p className="text-sm leading-relaxed text-navy-600">
            Build the first handoff draft from your canonical record. SmartProBonoIP
            will reuse facts it already knows and mark unanswered questions instead
            of guessing.
          </p>
          <button
            type="button"
            onClick={() => void prepare()}
            disabled={working}
            className="btn-primary mt-4"
          >
            {working
              ? "Mapping…"
              : selectedTemplateId
                ? "Prepare selected intake"
                : "Prepare professional intake"}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-mist-200 bg-mist-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              {(handoff.organizationName ?? "Professional") + " · " + handoff.templateName}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-navy-700">
              <span>{handoff.mappedQuestionCount} mapped</span>
              <span>{handoff.unresolvedQuestionCount} need input</span>
              <span>Status: {handoff.status.replaceAll("_", " ")}</span>
              {handoff.sharedAt ? (
                <span>
                  Shared {new Date(handoff.sharedAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            {handoff.answers.map((answer) => {
              const value = displayValue(answer.answerValue);
              const className = [
                "rounded-xl border p-4",
                answerTone(answer),
              ].join(" ");
              return (
                <div key={answer.id} className={className}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      {answer.sectionName ? (
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                          {answer.sectionName}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm font-semibold text-navy-900">
                        {answer.questionText}
                        {answer.requiredByProfessional ? " *" : ""}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-navy-500">
                      {answer.resolutionMethod === "unresolved"
                        ? "Needs input"
                        : answer.userApprovedAt
                          ? "Approved"
                          : answer.confidence === "exact"
                            ? "Mapped"
                            : "Review mapped answer"}
                    </span>
                  </div>
                  {value ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-navy-700">
                      {value}
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-amber-800">
                        SmartProBonoIP does not have enough factual information to answer this yet.
                      </p>
                      <textarea
                        rows={3}
                        className="input-surface"
                        placeholder="Add the factual answer here. This becomes part of the handoff record."
                        value={draftAnswers[answer.questionId] ?? ""}
                        onChange={(e) =>
                          setDraftAnswers((current) => ({
                            ...current,
                            [answer.questionId]: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="btn-secondary text-xs"
                        disabled={working}
                        onClick={() => void saveUnresolvedAnswer(answer.questionId)}
                      >
                        Save answer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-mist-200 pt-4">
            <button
              type="button"
              className="btn-secondary"
              disabled={working}
              onClick={() => void prepare()}
            >
              {working
                ? "Refreshing…"
                : selectedTemplateId &&
                    selectedTemplateId !== handoff.templateId
                  ? "Prepare selected intake"
                  : "Refresh mapping"}
            </button>
            {handoff.mappedQuestionCount > 0 ? (
              <button
                type="button"
                className="btn-primary"
                disabled={working}
                onClick={() => void approveMapped()}
              >
                Approve mapped answers
              </button>
            ) : null}
            {handoff.organizationName &&
            handoff.status === "approved" &&
            !handoff.sharedAt ? (
              <button
                type="button"
                className="btn-primary"
                disabled={working}
                onClick={() => void shareWithOrganization()}
              >
                Share approved intake with {handoff.organizationName}
              </button>
            ) : null}
          </div>

          {handoff.unresolvedQuestionCount > 0 ? (
            <p className="text-xs leading-relaxed text-navy-500">
              Unresolved questions stay unresolved. The mapper does not invent facts to make
              the intake look complete.
            </p>
          ) : null}
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-amber-800">{error}</p> : null}
    </Card>
  );
}
