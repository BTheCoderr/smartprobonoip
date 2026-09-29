import "server-only";

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GENERIC_UNAUTHORIZED } from "@/lib/security/api";

export type PlatformAuthContext = {
  userId: string;
  email: string | null;
};

export async function getPlatformAuth(): Promise<PlatformAuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;
  return { userId: data.user.id, email: data.user.email ?? null };
}

export async function requirePlatformAuth(): Promise<PlatformAuthContext | NextResponse> {
  const auth = await getPlatformAuth();
  if (!auth) {
    return NextResponse.json({ error: GENERIC_UNAUTHORIZED }, { status: 401 });
  }
  return auth;
}

export function isPlatformAuthContext(
  value: PlatformAuthContext | NextResponse,
): value is PlatformAuthContext {
  return !(value instanceof NextResponse);
}
