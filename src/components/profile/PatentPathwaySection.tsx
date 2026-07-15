import { Card, CardHeader } from "@/components/ui/Card";
import { PACKET_COPY } from "@/lib/copy";
import {
  PATENT_PATHWAY_INTRO,
  PATENT_PATHWAY_STAGES,
} from "@/lib/content/patentPathway";

export function PatentPathwaySection() {
  return (
    <Card>
      <CardHeader
        title={PACKET_COPY.pathwayTitle}
        subtitle={PATENT_PATHWAY_INTRO}
      />
      <ol className="space-y-3">
        {PATENT_PATHWAY_STAGES.map((stage, idx) => (
          <li
            key={stage.id}
            className="flex gap-3 rounded-xl border border-mist-200/80 bg-mist-50/60 px-4 py-3"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
              {idx + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-navy-800">
                {stage.title}
              </span>
              <span className="mt-0.5 block text-sm leading-relaxed text-navy-600">
                {stage.description}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
