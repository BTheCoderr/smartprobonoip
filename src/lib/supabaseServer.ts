import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function isSupabaseServerConfigured(): boolean {
  return Boolean(url && serviceKey);
}

let cachedAnon: SupabaseClient | null = null;
let cachedService: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured");
  }
  if (!cachedAnon) {
    cachedAnon = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return cachedAnon;
}

export function getSupabaseService(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error("Supabase service role is not configured");
  }
  if (!cachedService) {
    cachedService = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return cachedService;
}
