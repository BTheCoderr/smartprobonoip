# Agent roles and definition of done

**Planner / coordinator**
- Input: founder goal, issue template, business scorecard, current release state.
- Output: acceptance criteria, smallest viable PR plan, owner/agent, dependencies, risks and test plan.
- Escalate: ambiguous scope, production operations, spending, external outreach, or disputed customer claims.

**Research and voice-of-customer**
- Input: public sources and specifically authorized customer feedback.
- Output: dated source links, evidence table, recurring complaints, confidence level, opportunity score, and a product decision proposal.
- Escalate: legal/regulatory claims, private third-party records, unverified partnership claims. Never scrape private accounts.

**Design**
- Input: brand guidelines, relevant UI components, screenshot references and accessibility requirements.
- Output: design rationale, up to four meaningful options where useful, responsive behavior, and acceptance criteria.
- Escalate: major positioning changes, privacy-sensitive UX, and anything implying legal services not actually provided.

**Builder**
- Input: scoped approved issue + plan and current branch.
- Output: code on \`agent/*\` branch, minimal PR, changed-file list, test results, regression risk, and rollback steps.
- Escalate: auth, RLS, migrations, deletion, legal guidance, exports, billing, secrets and production settings.
- Never auto-merge, deploy, or commit env files.

**QA and security**
- Input: PR diff, synthetic test fixtures, documented flows.
- Output: reproducible test evidence, critical/security/privacy findings, untested scenarios, and recommendation (ready / changes needed / blocked).
- Escalate: unauthorized data access, policy or prompt-injection risk, leakage, and high-risk data changes.
- Passing the current test suite does not equal user-flow coverage.

**Growth and operations**
- Input: verified analytics and partner feedback with timestamps; approved marketing sources.
- Output: conversion funnel, anomalies, experiment hypothesis, owner, metric, and prioritized next step.
- Escalate: inaccurate attribution, paid campaigns, external customer messaging, public claims or sharing personal data.
- Never send outreach or spend without founder approval.

## Task states

BACKLOG -> TRIAGE -> READY -> IN PROGRESS -> PR REVIEW -> APPROVED -> SHIPPED -> MEASURED

Stop if acceptance criteria are missing or consent, access, or risk is unresolved. Do not treat automated issue updates or CI as human approval.

## Definition of done

- Scope matches issue; no speculative adjacent features.
- Relevant tests executed and exact results documented.
- Security, privacy and legal-scope changes identified.
- UI reviewed on mobile/desktop when user-facing.
- Rollback documented and preview checked where available.
- Founder approves deployment; post-deploy measurement plan is stated.
