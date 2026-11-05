# Evidence ledger for first SmartProBono pilots

Review this before reporting results publicly or in a grant/application.

## What each outcome actually establishes

| Outcome | Acceptable evidence | What it does NOT prove |
|---|---|---|
| Inventor session invited | Permissioned invitation log | Participation or product use |
| Inventor session held | Consent + session completed in private research log | Completed real packet |
| Fictional demo finished | Observed demo walkthrough | Real inventor traction |
| Real packet completed | Confirmed non-demo packet in authorized system | Unique person or professional review |
| Professional sample reviewed | Reviewer confirms review of fictional sample | Partnership or review of an actual client |
| Handoff prepared | Export-completed event | Delivered to or accepted by lawyer |
| Real professional handoff | Separate confirmation of delivery/receipt, with inventor permission | Advice or lawyer-client relationship |
| Professional time saved | Comparable recorded baseline and review durations, permission to use results | Proof across all reviewers |
| Paying organization | Confirmed billing/payment evidence | Recurring revenue unless sustained |

## Scorecard for a weekly review

Capture **reporting period, source, sample size, and uncertainty**. Do not populate unknowns with zero.

- Invited opt-in inventors (target 5): unverified
- Inventor study sessions held: unverified
- Fictional demo completions: unverified
- Real completed inventor packets: unverified
- Professional sample reviewers (target 2): unverified
- Confirmed real packet handoffs: unverified
- Professionals judging sample useful: unverified
- Reviewer time saved: not measured
- Pilot feedback themes: not collected
- Follow-up conversations approved: unverified

## Guardrails

The new dashboard's real-only funnel groups activity by session identifiers, not verified distinct individuals, and only counts events explicitly tagged \`demo=false\`. Unknown-tagged events do not enter real counts. The event query is currently capped at 5,000; deduplication can be incomplete across windows or devices. Existing dashboard panels may display demo records.

Don't collect full names, emails, private ideas, real case facts, secret keys, legal advice, or raw packet text in GitHub issues or Actions logs. Treat an export as preparation, not proof of reviewer receipt. Keep raw feedback in a permitted private system with retention and withdrawal controls.

## Decision rules after seven sessions

- If multiple inventors get blocked on the same step: fix usability first.
- If professionals consistently identify missing facts: prioritize packet structure.
- If reviewers find the packet unnecessary: narrow the target use case.
- If any evidence is unavailable or unconsented: report *not measured*.
- Only expand to real disclosures after privacy and storage review; do not mistake green CI for operational confidentiality approval.
