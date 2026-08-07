"use client";

import { useEffect, useState } from "react";
import { Timeline } from "@/components/timeline/Timeline";
import { Card, CardHeader } from "@/components/ui/Card";
import { getStore } from "@/lib/store";
import type { TimelineEvent } from "@/lib/timeline/types";

export function InventionTimelineCard({
  inventionId,
  isDemo = false,
}: {
  inventionId: string;
  isDemo?: boolean;
}) {
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);

  useEffect(() => {
    if (isDemo) return;
    let active = true;
    getStore()
      .getTimeline(inventionId)
      .then((next) => {
        if (active) setEvents(next);
      })
      .catch(() => {
        if (active) setEvents([]);
      });
    return () => {
      active = false;
    };
  }, [inventionId, isDemo]);

  if (isDemo || events === null || events.length === 0) return null;

  return (
    <Card>
      <CardHeader
        title="Invention timeline"
        subtitle="What you have done so far on this invention. Separate from the development dates you record for a professional."
      />
      <Timeline events={events} label="Invention timeline" />
    </Card>
  );
}
