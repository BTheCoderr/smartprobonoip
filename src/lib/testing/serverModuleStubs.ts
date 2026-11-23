/**
 * Test-only module stubs for node:test (imported by *.test.ts files only).
 *
 * - `server-only` throws outside the React Server condition, which is how
 *   `npm test` runs; tests that exercise server modules need it as a no-op.
 * - `@supabase/supabase-js` is replaced by a client whose calls delegate to
 *   `globalThis.__fakeSupabase`, so tests never touch the network or a real
 *   project.
 *
 * Uses module.registerHooks (Node >= 22.15), which applies to both require()
 * (tsx runs these .ts files as CommonJS) and import.
 *
 * Import this module BEFORE dynamically importing the server module under
 * test: `await import("./records")` after `import "../testing/serverModuleStubs"`.
 */
import * as nodeModule from "node:module";

const STUB_SOURCES: Record<string, string> = {
  "server-only": "module.exports = {};",
  "@supabase/supabase-js":
    "exports.createClient = function createClient() {" +
    "  return new Proxy({}, { get: function (_t, prop) {" +
    "    return globalThis.__fakeSupabase ? globalThis.__fakeSupabase[prop] : undefined;" +
    "  } });" +
    "};",
};

const PREFIX = "spb-test-stub:";

type ResolveResult = { url: string; shortCircuit?: boolean; format?: string };
type LoadResult = { format: string; source: string; shortCircuit?: boolean };
type Hooks = {
  resolve: (s: string, c: unknown, next: (s: string, c: unknown) => ResolveResult) => ResolveResult;
  load: (u: string, c: unknown, next: (u: string, c: unknown) => LoadResult) => LoadResult;
};

const registerHooks = (nodeModule as unknown as { registerHooks?: (hooks: Hooks) => void }).registerHooks;
if (typeof registerHooks !== "function") {
  throw new Error("serverModuleStubs requires Node.js >= 22.15 (module.registerHooks)");
}

registerHooks({
  resolve(specifier, context, next) {
    if (Object.prototype.hasOwnProperty.call(STUB_SOURCES, specifier)) {
      return { url: PREFIX + specifier, format: "commonjs", shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith(PREFIX)) {
      return { format: "commonjs", source: STUB_SOURCES[url.slice(PREFIX.length)], shortCircuit: true };
    }
    return next(url, context);
  },
});

export {};
