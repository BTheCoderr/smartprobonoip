import { isSupabaseConfigured } from "../supabaseClient";
import { apiStore } from "./api";
import { localStore } from "./local";
import type { Store } from "./types";

export type { Store, SaveInput, StoreBackend } from "./types";

export function getStore(): Store {
  return isSupabaseConfigured() ? apiStore : localStore;
}

export function getBackendName(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}
