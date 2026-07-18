/**
 * Safe server logging helpers. Never log invention text, emails, secrets,
 * recovery tokens, API keys, or full request bodies.
 */

const REDACT = "[REDACTED]";

const SENSITIVE_KEY =
  /^(authorization|cookie|x-partner-secret|x-api-key|password|secret|token|email|recovery|api[_-]?key|whatcreated|problemsolved|howitworks|mainparts|whatdifferent|ownershipnotes|message|body)$/i;

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const BEARER_RE = /\bBearer\s+[A-Za-z0-9._\-]+/gi;
const LONG_TOKEN_RE = /\b[A-Za-z0-9_-]{32,}\b/g;
const OPENAI_KEY_RE = /\bsk-[A-Za-z0-9]{20,}\b/g;

export function redactString(value: string): string {
  return value
    .replace(OPENAI_KEY_RE, REDACT)
    .replace(BEARER_RE, `Bearer ${REDACT}`)
    .replace(EMAIL_RE, REDACT)
    .replace(LONG_TOKEN_RE, REDACT);
}

export function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return REDACT;
  if (typeof value === "string") return redactString(value);
  if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => redactValue(item, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(key)) {
        out[key] = REDACT;
        continue;
      }
      out[key] = redactValue(nested, depth + 1);
    }
    return out;
  }
  return REDACT;
}

export function safeErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Unknown error";
  return redactString(err.message)
    .replace(
      /\b(whatCreated|problemSolved|howItWorks|mainParts|whatDifferent|ownershipNotes|token|email|secret|apiKey|api_key)\b\s*[=:]\s*("[^"]*"|'[^']*'|[^\s,;]+)/gi,
      `$1=${REDACT}`,
    )
    .slice(0, 300);
}

export function logServerError(
  scope: string,
  err: unknown,
  meta?: Record<string, unknown>,
): void {
  const payload = {
    scope,
    message: safeErrorMessage(err),
    meta: meta ? redactValue(meta) : undefined,
  };
  console.error("[smartprobonoip]", JSON.stringify(payload));
}
