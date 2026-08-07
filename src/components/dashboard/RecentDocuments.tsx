import Link from "next/link";
import { DocumentDownloadButton } from "@/components/portfolio/DocumentDownloadButton";
import { Card, CardHeader } from "@/components/ui/Card";
import { documentDisplayLabel } from "@/lib/ideas/documents";
import type { GeneratedDocument } from "@/lib/ideas/types";
import { ROUTES } from "@/lib/routes";
import { formatEventDate, formatEventRelative } from "@/lib/timeline/format";

export function RecentDocuments({
  documents,
}: {
  documents: GeneratedDocument[];
}) {
  return (
    <Card>
      <CardHeader
        title="Recent documents"
        subtitle="Exports are generated in your browser and saved to your device. SmartProBonoIP does not keep a copy, so downloading again rebuilds the file from your invention."
      />

      {documents.length === 0 ? (
        <p className="text-sm text-navy-500">
          Packet and professional handoff exports you generate will be listed
          here.
        </p>
      ) : (
        <ul className="m-0 list-none space-y-3 p-0">
          {documents.map((document) => (
            <li key={document.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy-900">
                  {documentDisplayLabel(document)}
                </p>
                <Link
                  href={ROUTES.profile(document.inventionId)}
                  className="link-brand block truncate text-xs"
                >
                  {document.inventionTitle}
                </Link>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <time
                  dateTime={document.createdAt}
                  title={formatEventDate(document.createdAt)}
                  className="text-xs text-navy-400"
                >
                  {formatEventRelative(document.createdAt)}
                </time>
                <DocumentDownloadButton document={document} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
