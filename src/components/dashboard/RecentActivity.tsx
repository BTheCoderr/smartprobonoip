import { Timeline } from "@/components/timeline/Timeline";
import { Card, CardHeader } from "@/components/ui/Card";
import type { ActivityEvent } from "@/lib/timeline/types";

export function RecentActivity({ events }: { events: ActivityEvent[] }) {
  return (
    <Card>
      <CardHeader
        title="Recent activity"
        subtitle="What has happened across your portfolio."
      />
      <Timeline
        events={events}
        showInvention
        label="Recent portfolio activity"
        emptyMessage="Activity appears here as you prepare inventions."
      />
    </Card>
  );
}
