/** Validate app-relative redirect targets against cross-origin and parser tricks. */
const PLACEHOLDER_ORIGIN = "https://same-origin.invalid";
const MAX_LENGTH = 2048;
const UNSAFE_CHARS = /[\\\u0000-\u001f\u007f]/;

export function safeRelativeRedirect(value: string | null | undefined, fallback: string): string {
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
