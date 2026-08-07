# IP Readiness Platform architecture

SmartProBonoIP is evolving from a single patent intake tool into an **Intellectual Property Readiness Platform**. Phase 1 ships the **patent** path only. Other protection paths are registered in code as `coming_soon` modules — not fake product logic.

## Mental model

```
Landing: "What are you trying to protect?"
  ├── Patent              → live readiness workflow
  ├── Trademark           → coming soon (framework registered)
  ├── Copyright           → coming soon
  ├── Trade Secret & NDA  → coming soon
  └── Not sure?           → coming soon
```

Each path is a module. Shared platform services stay path-agnostic:

| Capability | Status | Existing implementation |
| --- | --- | --- |
| Auth / consent | Live | Dual-consent disclaimer + pilot session |
| Dashboard | Live | Partner metrics desk |
| Documents | Live | Packet PDF/JSON; `venture_documents` reserved |
| AI orchestration | Live | `/api/generate`, `/api/coach` + rule fallbacks |
| Professional handoff | Live | Expert brief, attorney export, bring-list |
| Portfolio tracking | Live | `ProjectRecord` store + recovery |

## Code map

| Path | Purpose |
| --- | --- |
| `src/lib/platform/` | Types, registry, shared service manifest |
| `src/lib/paths/patent/` | Live patent module + education + handoff brief |
| `src/lib/paths/{trademark,copyright,trade-secret,unsure}/` | Module registration only |
| `src/components/platform/` | Path chooser + coming-soon shell |
| `src/app/protect/[path]/` | Path entry (patent redirects to disclaimer) |

## Adding a future path

1. Implement readiness workflow under `src/lib/paths/<id>/` (intake, education, handoff).
2. Set `status: "available"` and `hasReadinessWorkflow: true`.
3. Point `entryHref` at the real flow.
4. Reuse shared auth, store, AI, dashboard, and export adapters — do not fork them.

Do **not** ship placeholder intake or fake packet generators for coming-soon paths.
