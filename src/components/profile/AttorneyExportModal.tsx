"use client";

import { useEffect, useRef, useState } from "react";
import { ExportGuidance } from "@/components/profile/ExportGuidance";
import { downloadPacketPdf } from "@/lib/pdf";
import { downloadCondensedAttorneyPdf } from "@/lib/pdfCondensed";
import {
  attorneyExportBaseName,
  buildAttorneyExportCsv,
  buildAttorneyExportPacket,
  downloadTextFile,
} from "@/lib/attorneyExport";
import { loadWorkspace } from "@/lib/research/client";
import { trackEvent } from "@/lib/analytics/client";
import { getStore } from "@/lib/store";
import type { DocumentGeneration } from "@/lib/ideas/types";
import type { SavedReference } from "@/lib/research/types";
import type { ProjectRecord } from "@/lib/types";

interface AttorneyExportModalProps {
  record: ProjectRecord;
  savedReferences: SavedReference[];
  onClose: () => void;
  defaultInventorName?: string;
  defaultInventorEmail?: string;
}

export function AttorneyExportModal({
  record,
  savedReferences: initialRefs,
  onClose,
  defaultInventorName = "",
  defaultInventorEmail = "",
}: AttorneyExportModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [exportedFor, setExportedFor] = useState("");
  const [inventorName, setInventorName] = useState(defaultInventorName);
  const [inventorEmail, setInventorEmail] = useState(defaultInventorEmail);
  const [includePdf, setIncludePdf] = useState(true);
  const [includeCondensedPdf, setIncludeCondensedPdf] = useState(true);
  const [includeJson, setIncludeJson] = useState(true);
  const [includeCsv, setIncludeCsv] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  async function handleExport(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const recipient = exportedFor.trim();
    if (!recipient) {
      setError("Enter the attorney email or firm name for this export.");
      return;
    }
    if (!includePdf && !includeCondensedPdf && !includeJson && !includeCsv) {
      setError("Select at least one export format.");
      return;
    }

    setSubmitting(true);
    try {
      let refs = initialRefs;
      if (refs.length === 0) {
        try {
          const workspace = await loadWorkspace(record);
          refs = workspace.savedReferences;
        } catch {
          refs = [];
        }
      }

      const inventor = {
        name: inventorName.trim() || undefined,
        email: inventorEmail.trim() || undefined,
      };
      const packet = buildAttorneyExportPacket(record, refs, recipient, inventor);
      const baseName = attorneyExportBaseName(record.id);
      const exported: string[] = [];

      const exportOptions = {
        attorneyExport: {
          exportedFor: recipient,
          inventorName: inventor.name,
          inventorEmail: inventor.email,
        },
      };

      if (includePdf) {
        downloadPacketPdf(record, refs, exportOptions);
        exported.push("PDF");
        trackEvent("pdf_downloaded", {
          projectId: record.id,
          metadata: {
            demo: record.isDemo ?? false,
            pdfDownloaded: true,
            savedReferenceCount: refs.length,
            attorneyExport: true,
          },
        });
      }

      if (includeCondensedPdf) {
        downloadCondensedAttorneyPdf(record, refs, exportOptions);
        exported.push("1-page brief");
      }

      if (includeJson) {
        downloadTextFile(
          JSON.stringify(packet, null, 2),
          `${baseName}.json`,
          "application/json",
        );
        exported.push("JSON");
      }

      if (includeCsv) {
        downloadTextFile(
          buildAttorneyExportCsv(packet),
          `${baseName}.csv`,
          "text/csv;charset=utf-8",
        );
        exported.push("CSV");
      }

      const generated: DocumentGeneration[] = [
        includePdf ? { kind: "readiness_packet", format: "pdf" } : null,
        includeCondensedPdf ? { kind: "attorney_brief", format: "pdf" } : null,
        includeJson ? { kind: "attorney_export", format: "json" } : null,
        includeCsv ? { kind: "attorney_export", format: "csv" } : null,
      ].filter((entry): entry is DocumentGeneration => entry !== null);

      if (!record.isDemo && generated.length > 0) {
        const store = getStore();
        await Promise.all(
          generated.map((generation) =>
            store.recordDocumentGenerated(record.id, generation),
          ),
        );

        // Preparing a handoff moves the invention forward, but never overrides a
        // status the inventor has already set past this point.
        const status = record.status ?? "packet_generated";
        if (status === "created" || status === "packet_generated" || status === "researching") {
          await store
            .updateInvention(record.id, { status: "professional_review" })
            .catch(() => undefined);
        }
      }

      trackEvent("attorney_export_completed", {
        projectId: record.id,
        metadata: {
          demo: record.isDemo ?? false,
          includePdf,
          includeCondensedPdf,
          includeJson,
          includeCsv,
          exportedFor: recipient,
        },
      });

      setSuccess(
        `Export ready — downloaded ${exported.join(", ")}. Preparation only; not legal advice.`,
      );
    } catch {
      setError("Could not complete the export. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/50 p-4 sm:items-center"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="attorney-export-title"
        className="w-full max-w-lg rounded-xl border border-mist-200 bg-white shadow-xl"
      >
        <form onSubmit={handleExport} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker text-muted-blue">Attorney handoff</p>
              <h2
                id="attorney-export-title"
                className="headline-editorial mt-2 text-2xl text-navy-900"
              >
                Export for Attorney
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                Download structured packet files for professional review.
                Preparation only — not legal advice.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md px-2 py-1 text-sm text-navy-500 hover:bg-mist-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <label className="mt-6 block text-sm">
            <span className="font-medium text-navy-800">
              Attorney email or firm
            </span>
            <input
              required
              type="text"
              value={exportedFor}
              onChange={(event) => setExportedFor(event.target.value)}
              placeholder="name@firm.com or Example IP Firm"
              className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-navy-800">
                Inventor name <span className="font-normal text-navy-500">(optional)</span>
              </span>
              <input
                type="text"
                value={inventorName}
                onChange={(event) => setInventorName(event.target.value)}
                placeholder="Pre-filled if available"
                className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-navy-800">
                Inventor email <span className="font-normal text-navy-500">(optional)</span>
              </span>
              <input
                type="email"
                value={inventorEmail}
                onChange={(event) => setInventorEmail(event.target.value)}
                placeholder="Pre-filled if available"
                className="mt-1 w-full rounded-lg border border-mist-300 px-3 py-2"
              />
            </label>
          </div>

          <fieldset className="mt-5 space-y-3">
            <legend className="text-sm font-medium text-navy-800">
              Export formats
            </legend>
            <label className="flex items-start gap-3 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={includePdf}
                onChange={(event) => setIncludePdf(event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">PDF packet</span>
                <span className="mt-0.5 block text-navy-500">
                  Handoff PDF with attorney export banner when selected here.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={includeCondensedPdf}
                onChange={(event) => setIncludeCondensedPdf(event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">1-page attorney brief</span>
                <span className="mt-0.5 block text-navy-500">
                  Condensed summary for a quick first read — idea, readiness, gaps,
                  and meeting checklist.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={includeJson}
                onChange={(event) => setIncludeJson(event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Structured JSON</span>
                <span className="mt-0.5 block text-navy-500">
                  Includes disclaimer object, timeline, prior art, and readiness
                  score.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={includeCsv}
                onChange={(event) => setIncludeCsv(event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">CSV summary</span>
                <span className="mt-0.5 block text-navy-500">
                  Flat field/value spreadsheet for quick review.
                </span>
              </span>
            </label>
          </fieldset>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {success ? (
            <div className="mt-4 space-y-4">
              <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                {success}
              </p>
              <ExportGuidance />
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? "Preparing export…" : "Download export"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
            >
              {success ? "Close" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
