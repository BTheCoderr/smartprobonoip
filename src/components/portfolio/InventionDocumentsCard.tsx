"use client";

import { useCallback, useEffect, useState } from "react";
import { DocumentDownloadButton } from "@/components/portfolio/DocumentDownloadButton";
import { Card, CardHeader } from "@/components/ui/Card";
import { generateArtifact } from "@/lib/documents/generate";
import { documentDisplayLabel } from "@/lib/ideas/documents";
import type { DocumentRecord } from "@/lib/ideas/types";
import { getStore } from "@/lib/store";
import { formatEventDate } from "@/lib/timeline/format";
import type { SavedReference } from "@/lib/research/types";
import type { ProjectRecord } from "@/lib/types";

/**
 * Documents generated for one invention, plus the intake summary, which has no
 * other entry point.
 */
export function InventionDocumentsCard({
  record,
  savedReferences,
}: {
  record: ProjectRecord;
  savedReferences: SavedReference[];
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [generating, setGenerating] = useState(false);
  const isDemo = record.isDemo ?? false;

  const refresh = useCallback(() => {
    if (isDemo) return Promise.resolve();
    return getStore()
      .listDocuments(record.id)
      .then(setDocuments)
      .catch(() => undefined);
  }, [isDemo, record.id]);

  useEffect(() => {
    let active = true;
    if (isDemo) return;
    getStore()
      .listDocuments(record.id)
      .then((next) => {
        if (active) setDocuments(next);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isDemo, record.id]);

  if (isDemo) return null;

  async function handleIntakeSummary() {
    setGenerating(true);
    try {
      generateArtifact({
        record,
        savedReferences,
        kind: "intake_summary",
        format: "md",
      });
      await getStore().recordDocumentGenerated(record.id, {
        kind: "intake_summary",
        format: "md",
      });
      await refresh();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Documents"
        subtitle="Everything you have generated for this invention. Files are built in your browser and never stored by SmartProBonoIP, so downloading again rebuilds them from your current answers."
      />

      {documents.length === 0 ? (
        <p className="text-sm text-navy-500">
          You have not generated any documents for this invention yet.
        </p>
      ) : (
        <ul className="m-0 list-none space-y-3 p-0">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy-900">
                  {documentDisplayLabel(document)}
                </p>
                <p className="text-xs text-navy-400">
                  {formatEventDate(document.createdAt)}
                </p>
              </div>
              <DocumentDownloadButton document={document} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-mist-200 pt-4">
        <button
          type="button"
          onClick={() => void handleIntakeSummary()}
          disabled={generating}
          className="btn-secondary text-sm"
        >
          {generating ? "Preparing…" : "Download intake summary"}
        </button>
        <p className="mt-2 text-xs text-navy-500">
          A plain-text copy of what you entered, readable without this app.
        </p>
      </div>
    </Card>
  );
}
