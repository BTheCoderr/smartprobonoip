/**
 * Tables removed when a `smartprobonoip_projects` row is deleted.
 *
 * Invention and session deletion must DELETE projects only. Child rows —
 * including `smartprobonoip_project_events` — are removed by Postgres
 * `ON DELETE CASCADE`. Do not add a second DELETE against those tables.
 */

export type CascadeRelation =
  | "cascade"
  /** Telemetry keeps a row with project_id nulled so aggregates survive. */
  | "set_null";

export interface ProjectChildTable {
  table: string;
  onDelete: CascadeRelation;
  /** Human note for ops / privacy docs. */
  note: string;
}

/**
 * Source of truth for privacy implementation notes and regression tests.
 * Keep aligned with supabase migrations.
 */
export const PROJECT_CHILD_TABLES: readonly ProjectChildTable[] = [
  {
    table: "smartprobonoip_answers",
    onDelete: "cascade",
    note: "Intake answers payload",
  },
  {
    table: "smartprobonoip_profiles",
    onDelete: "cascade",
    note: "Generated readiness profile",
  },
  {
    table: "smartprobonoip_referrals",
    onDelete: "cascade",
    note: "Suggested resources",
  },
  {
    table: "smartprobonoip_impact_metrics",
    onDelete: "cascade",
    note: "Clarity / packet metrics",
  },
  {
    table: "followups",
    onDelete: "cascade",
    note: "30/60/90 follow-up rows",
  },
  {
    table: "smartprobonoip_recovery_tokens",
    onDelete: "cascade",
    note: "Hashed recovery tokens for the invention",
  },
  {
    table: "smartprobonoip_feedback",
    onDelete: "cascade",
    note: "Pilot feedback",
  },
  {
    table: "smartprobonoip_saved_references",
    onDelete: "cascade",
    note: "Research workspace references",
  },
  {
    table: "smartprobonoip_project_events",
    onDelete: "cascade",
    note: "Inventor-facing timeline milestones",
  },
  {
    table: "smartprobonoip_documents",
    onDelete: "cascade",
    note: "Generated document records (metadata only today)",
  },
  {
    table: "smartprobonoip_analytics_events",
    onDelete: "set_null",
    note: "Product telemetry; project_id cleared, row retained anonymized",
  },
  {
    table: "organization_referrals",
    onDelete: "cascade",
    note: "Inventor-initiated org referral snapshots",
  },
] as const;

export const CASCADE_DELETED_TABLES = PROJECT_CHILD_TABLES.filter(
  (entry) => entry.onDelete === "cascade",
).map((entry) => entry.table);

export const PROJECT_EVENTS_TABLE = "smartprobonoip_project_events";

export function isCascadeDeletedWithProject(table: string): boolean {
  return CASCADE_DELETED_TABLES.includes(table);
}

/**
 * In-memory model of project → event cascade for regression tests.
 * Mirrors Postgres: deleting a project removes every event for that project_id.
 * Session deletion is "delete every project with that session", not a direct
 * delete on events by pilot_session_id (events may still carry a prior session
 * id after recovery rebinds ownership).
 */
export class CascadeDeletionModel {
  private readonly projects = new Map<
    string,
    { id: string; pilotSessionId: string }
  >();
  private readonly events = new Map<
    string,
    { id: string; projectId: string; pilotSessionId: string | null }
  >();

  addProject(id: string, pilotSessionId: string): void {
    this.projects.set(id, { id, pilotSessionId });
  }

  addEvent(
    id: string,
    projectId: string,
    pilotSessionId: string | null = null,
  ): void {
    if (!this.projects.has(projectId)) {
      throw new Error(`Cannot add event for missing project ${projectId}`);
    }
    this.events.set(id, { id, projectId, pilotSessionId });
  }

  /** Single deletion path: remove the invention; events follow. */
  deleteProject(projectId: string): number {
    if (!this.projects.has(projectId)) return 0;
    this.projects.delete(projectId);
    let removed = 0;
    for (const [eventId, event] of this.events) {
      if (event.projectId === projectId) {
        this.events.delete(eventId);
        removed += 1;
      }
    }
    return removed;
  }

  /**
   * Session deletion = delete every project owned by the session.
   * Events are removed only through project cascade, never by session id.
   */
  deleteSession(pilotSessionId: string): { projects: number; events: number } {
    const ids = [...this.projects.values()]
      .filter((project) => project.pilotSessionId === pilotSessionId)
      .map((project) => project.id);

    let events = 0;
    for (const id of ids) {
      events += this.deleteProject(id);
    }
    return { projects: ids.length, events };
  }

  eventCountForProject(projectId: string): number {
    return [...this.events.values()].filter((e) => e.projectId === projectId)
      .length;
  }

  totalEvents(): number {
    return this.events.size;
  }

  totalProjects(): number {
    return this.projects.size;
  }

  orphanEventCount(): number {
    return [...this.events.values()].filter((e) => !this.projects.has(e.projectId))
      .length;
  }
}
