"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName } from "@/lib/analytics/events";

export function PageEvent({
  event,
  metadata,
}: {
  event: AnalyticsEventName;
  metadata?: Record<string, string | number | boolean | undefined>;
}) {
  useEffect(() => {
    trackEvent(event, { metadata });
  }, [event, metadata]);

  return null;
}
