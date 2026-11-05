# Pilot conversion and reviewer-value evidence contract

Issue: https://github.com/BTheCoderr/smartprobonoip/issues/25

## Data we already have
- \`src/lib/analytics/events.ts\`: \`intake_started\`, \`intake_completed\`, \`attorney_export_completed\`, \`feedback_submitted\`, plus step-level events.
- \`src/lib/analytics/client.ts\`: product event payloads with \`metadata.demo\` on relevant intake and export events.
- \`src/app/api/partner/analytics/route.ts\`: partner-secret-protected analytics aggregates. **No public analytics endpoint** has been added.
- \`src/app/api/partner/feedback/route.ts\`: inventor feedback, not professional review.
- \`src/lib/db/analytics.ts\`: server-side event query capped at the 5,000 newest matching rows; empty/not configured must not be interpreted as verified zero activity.
- \`src/app/pilot-tracker\`: manual outreach records held in each browser's localStorage only, not a shared/verified source of partner commitments.

## New private funnel
\`computePilotFunnelScorecard\` groups the relevant events by pilot session identifier, then anonymous ID or project ID as fallback **without exposing those IDs**. It requires an explicit boolean \`demo: false\` (or \`isDemo: false\`). Demo-tagged and unclassified events are separately counted/excluded. Repeated events per session are deduplicated. A missing ID means the event is excluded from unique-session counts.

Displays:
- confirmed real intake **sessions** (not necessarily distinct people)
- confirmed real completion signals (not all successfully reviewed packets)
- confirmed real professional export sessions (**prepared**, not sent to someone)
- matched completed/started session percentage among events in the selected time window (not longitudinal cohort conversion)
- excluded demo, unclassified and unidentifiable event counts

The existing dashboard may still include fictional demo records in its other exploratory sections; **do not use those sections for external traction claims**. The new "Verified inventor funnel" explicitly excludes demo and unknown-tagged events.

## Evidence missing / proposed verification
- **Actual professional handoffs** require recipient receipt/authorized delivery confirmation; export button clicks alone do not qualify.
- **Professional reviewer usefulness** requires explicit written reviewer feedback, tied to an approved review; inventor \`wouldBringToExpert\` feedback is only intent.
- **Time saved** needs paired baseline and review-duration measurements, with reviewer consent and a documented calculation. Do not infer minutes from clickstream data.
- **Attribution and partner activation** need a verified partner agreement and real referral/review, not a marketing URL tag.
- **Unique inventor counts** require an authorized identity/deduplication policy, not just browser session IDs.
- **Population completeness** requires an uncapped date-scoped query or explicit coverage reporting. This current view is limited to the most recent 5,000 matching events; if at the cap, a warning appears.

## Approval boundaries
This change does not add trackers, cookies, network requests, event payload fields, database migrations, or access to live inventor content. It only summarizes already-authorized event rows in the existing authenticated dashboard. No secrets or personal records are returned in the new scorecard shape. Founder/privacy review is required before external analytics connectors or recording named reviewer feedback.

## Tests
\`src/lib/pilotScorecard.test.ts\` covers de-duplication, demo isolation, unknown provenance, missing identity, no invented review/time evidence, and truncated-window warnings.

## Pilot targets, not claims
First operational targets: five real inventors finish the existing workflow and two IP professionals evaluate *fictional* or appropriately permissioned handoffs. Track outreach and feedback with consent; never publicly claim these targets have been achieved until verified.
