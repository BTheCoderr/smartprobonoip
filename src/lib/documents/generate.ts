import {
  attorneyExportBaseName,
  buildAttorneyExportCsv,
  buildAttorneyExportPacket,
  downloadTextFile,
} from "@/lib/attorneyExport";
import type { DocumentFormat, DocumentKind } from "@/lib/ideas/types";
import { downloadPacketPdf } from "@/lib/pdf";
import { downloadCondensedAttorneyPdf } from "@/lib/pdfCondensed";
import type { SavedReference } from "@/lib/research/types";
import type { ProjectRecord } from "@/lib/types";
import {
  buildIntakeSummaryMarkdown,
  intakeSummaryFileName,
} from "./intakeSummary";

export interface AttorneyExportContext {
  exportedFor: string;
  inventorName?: string;
  inventorEmail?: string;
}

export interface GenerateArtifactInput {
  record: ProjectRecord;
  savedReferences: SavedReference[];
  kind: DocumentKind;
  format: DocumentFormat;
  /** Present when the artifact is produced as part of an attorney handoff. */
  attorneyExport?: AttorneyExportContext;
}

/**
 * Produces an artifact and hands it to the browser's download.
 *
 * Documents are regenerated from the invention every time rather than stored,
 * so a download always reflects the current state of the packet and the app
 * never retains a copy of an inventor's file.
 */
export function generateArtifact(input: GenerateArtifactInput): void {
  const { record, savedReferences, kind, format, attorneyExport } = input;
  const options = attorneyExport ? { attorneyExport } : undefined;

  if (kind === "readiness_packet" && format === "pdf") {
    downloadPacketPdf(record, savedReferences, options);
    return;
  }

  if (kind === "attorney_brief" && format === "pdf") {
    downloadCondensedAttorneyPdf(record, savedReferences, options);
    return;
  }

  if (kind === "intake_summary" && format === "md") {
    downloadTextFile(
      buildIntakeSummaryMarkdown(record, savedReferences.length),
      intakeSummaryFileName(record.id),
      "text/markdown;charset=utf-8",
    );
    return;
  }

  if (kind === "attorney_export") {
    // Regenerated handoffs carry no recipient unless one was supplied here.
    const packet = buildAttorneyExportPacket(
      record,
      savedReferences,
      attorneyExport?.exportedFor ?? "",
      {
        name: attorneyExport?.inventorName,
        email: attorneyExport?.inventorEmail,
      },
    );
    const baseName = attorneyExportBaseName(record.id);

    if (format === "csv") {
      downloadTextFile(
        buildAttorneyExportCsv(packet),
        `${baseName}.csv`,
        "text/csv;charset=utf-8",
      );
      return;
    }

    downloadTextFile(
      JSON.stringify(packet, null, 2),
      `${baseName}.json`,
      "application/json",
    );
    return;
  }

  throw new Error(`Unsupported document: ${kind}/${format}`);
}
