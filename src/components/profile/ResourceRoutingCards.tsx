import { NextBestStepsPanel } from "@/components/routing/NextBestStepsPanel";
import type { PilotFeedbackInput } from "@/lib/feedback";
import type { ProjectRecord } from "@/lib/types";

/**
 * Expandable secondary resources powered by the routing taxonomy.
 * Primary steps live in NextBestStepsPanel on the readiness dashboard.
 */
export function ResourceRoutingCards({
  record,
  feedback,
  savedReferenceCount = 0,
}: {
  record: ProjectRecord;
  feedback: PilotFeedbackInput | null;
  savedReferenceCount?: number;
}) {
  return (
    <NextBestStepsPanel
      record={record}
      savedReferenceCount={savedReferenceCount}
      supportNeeded={feedback?.supportNeeded ?? []}
      variant="view_all"
    />
  );
}
