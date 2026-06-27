export const ANALYTICS_EVENTS = [
  "landing_viewed",
  "sample_packet_viewed",
  "sample_pdf_downloaded",
  "pilot_page_viewed",
  "start_clicked",
  "demo_started",
  "disclaimer_accepted",
  "intake_started",
  "intake_step_viewed",
  "intake_step_completed",
  "intake_validation_error",
  "intake_review_viewed",
  "intake_completed",
  "packet_generated",
  "packet_viewed",
  "pdf_downloaded",
  "clarity_before_recorded",
  "clarity_after_recorded",
  "next_step_viewed",
  "recovery_link_created",
  "recovery_link_copied",
  "recovery_email_requested",
  "recovery_claim_started",
  "recovery_claim_succeeded",
  "recovery_claim_failed",
  "coach_opened",
  "coach_quick_action_clicked",
  "coach_message_sent",
  "coach_response_generated",
  "coach_error",
  "dashboard_viewed",
  "dashboard_filter_changed",
  "csv_exported",
  "resource_link_clicked",
  "similar_reference_link_clicked",
  "feedback_viewed",
  "feedback_submitted",
  "followup_requested",
  "resource_type_selected",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

const EVENT_SET = new Set<string>(ANALYTICS_EVENTS);

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return EVENT_SET.has(value);
}
