# SmartProBono Matter Readiness Safety Architecture

## Product boundary

SmartProBono is a legal preparation and handoff platform. It helps users learn, organize facts, identify missing information, prepare a structured matter record, and connect with qualified professionals. It does not replace professional legal judgment.

## Output classes

Every generated or rules-based user-facing conclusion should fit one of four classes:

1. **Organized facts** — restates or structures user-supplied facts without changing their legal meaning.
2. **General information** — explains legal-process concepts without deciding how the law applies to the user's matter.
3. **Readiness finding** — identifies completeness, missing information, or factual inconsistency.
4. **Professional review required** — identifies a fact or unresolved question whose legal consequence or strategy must be decided outside SmartProBono.

## Prohibited product behavior

SmartProBono should not independently determine patentability, registrability, inventorship, ownership, liability, eligibility, or likely case outcomes; prescribe a definitive filing or litigation strategy; or present AI output as attorney work product or legal representation.

A disclaimer is not a substitute for safe product behavior. The underlying output must stay within the boundary.

## Matter lifecycle

Learn → Prepare → Organize → Check Readiness → Flag for Professional Review → Connect → Handoff.

Professional review is a product state, not merely disclaimer copy.

## Engineering rules

- Prefer deterministic readiness rules for completeness and consistency checks.
- AI may summarize, extract, classify, and explain, but should not convert facts into definitive individualized legal conclusions.
- Preserve source facts separately from generated summaries.
- User-facing drafts remain clearly labeled `DRAFT — FOR REVIEW`.
- High-consequence facts such as possible public disclosures, disputed ownership/contribution, uncertain deadlines, or jurisdiction-dependent requirements should produce review flags rather than definitive conclusions.
- Matter packets should distinguish user-supplied facts, generated summaries, readiness findings, and professional-review flags.

## Current audit priorities

The existing repository already contains strong safety primitives, readiness infrastructure, professional handoff, review flags, and a unified `legal_matters` account layer. The next audit should focus on the surfaces most likely to blur the boundary: legal chat, document analysis, draft generation, `recommendations`, routing/next-best-step language, patent search/reference comparison, and any UI that implies SmartProBono has decided a legal status.
