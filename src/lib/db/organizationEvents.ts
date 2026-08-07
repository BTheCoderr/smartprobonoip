import "server-only";
import type {
  OrganizationReferralEventType,
  OrganizationReferralActorType,
} from "@/lib/organization/types";
import { getSupabaseService } from "@/lib/supabaseServer";

export interface AppendReferralEventInput {
  referralId: string;
  organizationId: string;
  eventType: OrganizationReferralEventType;
  actorType: OrganizationReferralActorType;
  actorId?: string | null;
  priorStatus?: string | null;
  newStatus?: string | null;
  metadata?: Record<string, unknown>;
}

export async function appendReferralEvent(
  input: AppendReferralEventInput,
): Promise<boolean> {
  const sb = getSupabaseService();
  const { error } = await sb.from("organization_referral_events").insert({
    referral_id: input.referralId,
    organization_id: input.organizationId,
    event_type: input.eventType,
    actor_type: input.actorType,
    actor_id: input.actorId ?? null,
    prior_status: input.priorStatus ?? null,
    new_status: input.newStatus ?? null,
    metadata: input.metadata ?? {},
  });
  return !error;
}
