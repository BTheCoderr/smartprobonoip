"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  loadEvidence,
  openEvidence,
  removeEvidence,
  uploadEvidence,
} from "@/lib/canonical/client";
import type { CanonicalEvidenceFile } from "@/lib/types";

const TYPE_LABELS: Record<CanonicalEvidenceFile["evidenceType"], string> = {
  drawing: "Drawing",
  photo: "Photo",
  video: "Video",
  email: "Email",
  presentation: "Presentation",
  paper: "Paper / publication",
  notebook: "Notebook / notes",
  agreement: "Agreement",
  prototype_record: "Prototype record",
  search_result: "Search result",
  other: "Other",
};

function sizeLabel(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return String(bytes) + " B";
  if (bytes < 1024 * 1024) return String(Math.round(bytes / 1024)) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function EvidenceVaultCard({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<CanonicalEvidenceFile[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] =
    useState<CanonicalEvidenceFile["evidenceType"]>("other");
  const [documentDate, setDocumentDate] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function refresh() {
    setItems(await loadEvidence(projectId));
  }

  useEffect(() => {
    let active = true;
    loadEvidence(projectId)
      .then((next) => {
        if (active) setItems(next);
      })
      .catch(() => {
        if (active) setError("Could not load the Evidence Vault.");
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await uploadEvidence(projectId, {
        file,
        evidenceType,
        documentDate: documentDate || undefined,
        description: description || undefined,
      });
      await refresh();
      setFile(null);
      setEvidenceType("other");
      setDocumentDate("");
      setDescription("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload evidence.");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this file from the private Evidence Vault?")) return;
    try {
      await removeEvidence(projectId, id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete evidence.");
    }
  }

  return (
    <Card className="border-teal-200">
      <CardHeader
        title="Evidence Vault"
        subtitle="Private supporting files tied to this invention record. Files are stored in a non-public bucket and opened through short-lived signed links."
      />

      <form
        onSubmit={upload}
        className="space-y-3 rounded-xl border border-mist-200 bg-mist-50/40 p-4"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-navy-700"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-navy-800">
            Evidence type
            <select
              className="input-surface mt-1"
              value={evidenceType}
              onChange={(e) =>
                setEvidenceType(e.target.value as CanonicalEvidenceFile["evidenceType"])
              }
            >
              {Object.entries(TYPE_LABELS)
                .filter(([value]) => value !== "video")
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm font-medium text-navy-800">
            Document date
            <input
              type="date"
              className="input-surface mt-1"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-navy-800">
          What does this file show?
          <textarea
            rows={2}
            className="input-surface mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={uploading}>
            {uploading ? "Uploading…" : "Add to Evidence Vault"}
          </button>
          <span className="text-xs text-navy-500">10 MB maximum per file.</span>
        </div>
      </form>

      {items.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-mist-200 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-navy-900">
                  {item.originalFilename}
                </p>
                <p className="mt-1 text-xs text-navy-500">
                  {TYPE_LABELS[item.evidenceType]}
                  {item.documentDate ? " · " + item.documentDate : ""}
                  {item.sizeBytes ? " · " + sizeLabel(item.sizeBytes) : ""}
                </p>
                {item.description ? (
                  <p className="mt-2 text-sm text-navy-700">{item.description}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => void openEvidence(projectId, item.id)}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => void remove(item.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-navy-500">
          No files have been added to the Evidence Vault yet.
        </p>
      )}

      {error ? <p className="mt-3 text-sm text-amber-800">{error}</p> : null}
    </Card>
  );
}
