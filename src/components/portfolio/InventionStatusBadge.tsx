import { Badge } from "@/components/ui/Badge";
import { inventionStatusLabel, inventionStatusTone } from "@/lib/ideas/status";
import type { InventionStatus } from "@/lib/ideas/types";

export function InventionStatusBadge({ status }: { status: InventionStatus }) {
  return (
    <Badge tone={inventionStatusTone(status)}>
      {inventionStatusLabel(status)}
    </Badge>
  );
}
