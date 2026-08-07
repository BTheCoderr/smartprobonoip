"use client";

import { useState } from "react";
import { generateArtifact } from "@/lib/documents/generate";
import { documentDisplayLabel, isStoredDocument } from "@/lib/ideas/documents";
import type { DocumentRecord } from "@/lib/ideas/types";
import { loadWorkspace } from "@/lib/research/client";
import { getStore } from "@/lib/store";

/**
 * Downloads a previously generated artifact.
 *
 * Generated artifacts are not retained, so the file is rebuilt from the current
 * invention on demand. Once an artifact is persisted, `storageUrl` is served
 * directly instead.
 */
export function DocumentDownloadButton({
  document,
  className = "btn-ghost px-0 text-xs",
}: {
  document: DocumentRecord;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const label = documentDisplayLabel(document);

  if (isStoredDocument(document) && document.storageUrl) {
    return (
      <a
        href={document.storageUrl}
        download
        className={className}
        aria-label={`Download ${label}`}
      >
        Download
      </a>
    );
  }

  async function handleDownload() {
    setBusy(true);
    setError(false);
    try {
      const record = await getStore().getRecord(document.inventionId);
      if (!record) throw new Error("Invention not found");

      let savedReferences: Awaited<
        ReturnType<typeof loadWorkspace>
      >["savedReferences"] = [];
      try {
        savedReferences = (await loadWorkspace(record)).savedReferences;
      } catch {
        savedReferences = [];
      }

      generateArtifact({
        record,
        savedReferences,
        kind: document.kind,
        format: document.format,
      });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={busy}
        className={className}
        aria-label={`Download ${label} again`}
      >
        {busy ? "Preparing…" : "Download"}
      </button>
      {error ? (
        <span role="status" className="text-xs text-red-700">
          Could not rebuild this file.
        </span>
      ) : null}
    </span>
  );
}
