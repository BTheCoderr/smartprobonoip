# SmartProBono Unified Platform Consolidation

## Decision

SmartProBono is the umbrella platform.

SmartProBonoIP remains a specialized IP-readiness product inside SmartProBono. The canonical implementation moves forward in this repository because it already contains the newer Next.js architecture, security hardening, partner/organization infrastructure, canonical IP record, evidence/timeline systems, and professional handoff work.

The older `BTheCoderr/smartprobonolite` repository becomes a migration source, not a second product that must remain independently evolved.

## User-facing information architecture

```text
/
├── /legal
│   ├── /legal/ask-ermi
│   ├── /legal/draft
│   ├── /legal/record-clearing
│   ├── document understanding        (next migration slice)
│   └── RI eviction pilot             (next migration slice)
│
├── /ip
│   ├── patent readiness
│   ├── protection paths
│   ├── inventor workspace
│   ├── canonical IP records
│   ├── evidence/timeline
│   └── professional handoff
│
├── /workspace                        (current IP workspace; future unified workspace)
├── /organization                     (professional/partner portal)
├── /learn
├── /trust
└── /for-professionals
```

Historical `/smartprobonoip` remains a compatibility alias for `/ip`.

## What was reviewed

### SmartProBonoIP repository

Keep and extend:

- Next.js 16 / React 19 App Router foundation
- umbrella-platform database work already present in migrations
- inventor workspace and IP records
- canonical IP record
- contributors and structured disclosure timeline
- private evidence vault
- professional intake mapping
- review flags
- firm intake import/mapping review
- professional clarification requests
- explicit inventor-controlled sharing
- organization memberships/referrals
- partner analytics and pilot infrastructure
- recovery, security headers, request-size limits, and API rate limiting
- current Netlify deployment path

### SmartProBono Lite legal repository

Migrate capability-by-capability:

- Ermi legal assistant
- document upload and PDF/DOCX/TXT extraction
- document understanding / extraction workflow
- draft generation and export
- record-clearing preparation
- Rhode Island eviction intake
- Rhode Island grounding materials / RAG
- RI assistant
- printable case summary
- legal-team dashboard/persistence where still useful
- six-agent legal orchestration after the simple unified API surface is stable
- billing / Stripe only after the account model is unified
- attorney / lawyer lead flow after organization and professional roles are reconciled
- observability pieces that are still relevant

Do not copy wholesale:

- Next.js 14 / React 18 framework setup
- duplicate root layout/navigation/brand system
- mixed App Router + Pages Router routing structure
- duplicate Supabase client/auth implementation
- duplicate middleware
- legacy dashboard layout when the same job can live in the unified workspace
- old schema bootstrap/fix scripts without translating them into ordered migrations
- separate product identity "SmartProBono Lite"

## Current consolidation slice

Implemented natively in the unified repository:

1. SmartProBono umbrella homepage at `/`
2. SmartProBonoIP home at `/ip`
3. historical `/smartprobonoip` compatibility redirect
4. umbrella navigation and footer
5. SmartProBono global brand mark
6. SmartProBono Legal hub at `/legal`
7. native legal Ask Ermi surface
8. native legal draft builder
9. native record-clearing preparation flow
10. shared legal model adapter using the existing `GROQ_API_KEY`
11. request body limits, safe server logging, and rate limiting on new legal AI routes

## Data strategy

Do not force legal matters and IP records into one giant table.

Use shared identity and platform primitives, with domain-specific records underneath them.

Target model:

```text
auth.users
  └── platform profile
      ├── legal matters
      │   ├── legal facts / timeline
      │   ├── uploaded documents
      │   ├── generated drafts
      │   └── workflow-specific data
      │
      └── IP records
          ├── canonical IP facts
          ├── contributors
          ├── disclosures
          ├── evidence
          └── professional handoffs
```

Organizations/professionals should reference shared platform users and explicit referrals/shares rather than receiving automatic access to a user's private matter.

## Supabase migration rule

The current SmartProBonoIP production schema is the target database.

Do not run the old SmartProBono Lite schema files against production as-is.

For each legal capability:

1. identify the exact old tables/columns/policies it needs;
2. compare against current platform primitives;
3. reuse current tables where semantics truly match;
4. create a new numbered migration for legal-only data where they do not;
5. write RLS before exposing the feature;
6. migrate only required data;
7. verify production schema after deploy.

## Auth strategy

Target: one Supabase Auth session for the whole SmartProBono platform.

Do not preserve a separate "legal login" and "IP login."

Roles/capabilities should be modeled separately from identity:

- end user
- inventor (domain capability)
- legal user (domain capability)
- organization member
- professional reviewer
- admin/internal

A person can have more than one capability.

## AI strategy

Use a shared model adapter and separate domain prompts/orchestration.

Do not combine the IP generator and legal assistant into one giant system prompt.

- Legal: Ermi — factual organization, general explanation, draft preparation, grounded workflows
- IP: existing readiness/generation services
- Shared: request limits, safe logging, model-provider configuration, analytics, redaction patterns

The older six-agent legal graph should be ported only after the unified simple legal API is stable. That preserves its value without making the first consolidation dependent on LangGraph and the older dependency tree.

## Legal migration order

### Slice A — completed in consolidation branch

- umbrella product shell
- legal hub
- Ask Ermi
- draft builder
- record-clearing preparation

### Slice B — next

- port text extraction utilities
- add PDF/DOCX/TXT dependencies to the newer stack deliberately
- build `/legal/document`
- persist uploaded legal documents with RLS
- hand document context into Ermi
- add structured summary export

### Slice C

- port RI intake types/storage into platform matter records
- port deterministic RI guidance/issue flags
- port embedded/seeded source materials
- port legal RAG migration and retrieval
- port RI assistant
- port printable summary
- verify all jurisdiction-specific copy and citations

### Slice D

- unify signed-in dashboard/workspace
- legal matter persistence
- chat history
- generated document library
- organization/professional legal referrals

### Slice E

- reconcile Stripe plans against the unified account model
- port DOCX/PDF export
- port webhook idempotency/reconciliation
- remove old billing middleware assumptions

### Slice F

- port six-agent orchestration
- add streaming progress UI only after parity tests
- keep deterministic fallbacks for outages

## Workspace direction

The long-term `/workspace` should become a domain-neutral SmartProBono workspace:

- Legal Matters
- IP Records
- Documents
- Recent activity
- Start something new

During migration, the existing `/workspace` remains the inventor workspace so current IP users do not lose functionality.

## Acceptance criteria before retiring smartprobonolite

Do not archive the old legal repository until all of the following are true:

- legal chat parity is verified
- document upload/extraction handles PDF, DOCX, and TXT
- RI eviction flow passes end-to-end testing
- current legal RAG materials are migrated and grounded responses are verified
- legal persistence uses the unified Supabase project and RLS
- authentication works with the same platform account
- required exports work
- any paid entitlement still in use is migrated and tested
- analytics/observability needed for pilots is present
- production redirects are in place
- old Netlify legal deployment can be made read-only or retired without breaking user links

## Product rule

SmartProBono is the brand users enter.

SmartProBonoIP is the IP product.

The platform should route a user by their problem, not make them understand the codebase or company org chart first.
