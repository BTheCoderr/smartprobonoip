/**
 * Same-origin redirect guard for auth callbacks and sign-in `next` parameters.
 *
 * Accepts only an app-relative path ("/workspace?tab=ip#x"). Rejects absolute
 * URLs, protocol-relative URLs ("//host"), backslash forms ("/\\host") that
 * WHATWG URL parsing normalises to "//host", and control characters (tabs and
 * newlines are stripped by URL parsers and can turn "/\t/host" into "//host").
 *
 * Pure module: safe to import from client components and route handlers.
 */
const PLACEHOLDER_ORIGIN = "https://same-origin.invalid";
const MAX_LENGTH = 2048;
// Backslash plus C0 controls and DEL.
const UNSAFE_CHARS = /[\\\u0000-\u001f\u007f]/;

export function safeRelativeRedirect(
  value: string | null | undefined,
  fallback: string,
): string {
  if (typeof value !== "string") return fallback;
  if (value.length === 0 || value.length > MAX_LENGTH) return fallback;
  if (UNSAFE_CHARS.test(value)) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  let parsed: URL;
  try {
    parsed = new URL(value, PLACEHOLDER_ORIGIN);
  } catch {
    return fallback;
  }
  if (parsed.origin !== PLACEHOLDER_ORIGIN) return fallback;

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
