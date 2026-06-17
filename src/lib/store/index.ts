import { isSupabaseConfigured } from "../supabaseClient";
import { localStore } from "./local";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";

export type { Store, SaveInput, StoreBackend } from "./types";

export function getStore(): Store {
  return isSupabaseConfigured() ? supabaseStore : localStore;
}

export function getBackendName(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}
