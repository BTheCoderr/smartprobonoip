import { localStore } from "./local";
import type { Store } from "./types";

export type { Store, SaveInput, StoreBackend } from "./types";

export function getStore(): Store {
  return localStore;
}
