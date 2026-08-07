const ALLOWED_KEYS = new Set([
  "step",
  "stepNumber",
  "completionPercent",
  "signalKeys",
  "signals",
  "pdfDownloaded",
  "recoveryCreated",
  "clarityRating",
  "errorCode",
  "routeName",
  "demo",
  "field",
  "filterName",
  "filterValue",
  "action",
  "quickAction",
  "linkLabel",
  "linkType",
  "mode",
  "isDemo",
  "referenceType",
  "interestType",
  "label",
  "savedReferenceCount",
  "filledTimelineFields",
  "queryIndex",
  "resourceKey",
  "validationField",
  "eventCount",
  "clarityHelped",
  "scopeName",
  "restoredCount",
  "inventionCount",
  "sortMode",
  "recommendationId",
  "category",
  "partnerId",
  "projectId",
  "feedbackValue",
  "organizationType",
  "serviceCategory",
  "filterType",
  "resultCount",
  "fieldCount",
  "referralId",
  "referralStatus",
  "memberRole",
]);

const BLOCKED_KEY_PATTERN =
  /description|answer|email|token|recovery|password|secret|content|summary|idea|invention|prompt|message|name|whatcreated|problem|works|parts|location/i;

const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const LONG_TOKEN_PATTERN = /[A-Za-z0-9_-]{24,}/;

function sanitizeValue(value: unknown): string | number | boolean | null {
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 120) return null;
  if (EMAIL_PATTERN.test(trimmed)) return null;
  if (LONG_TOKEN_PATTERN.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed) && trimmed.includes("token=")) return null;
  return trimmed;
}

export function sanitizeAnalyticsMetadata(
  input: Record<string, unknown> | undefined | null,
): Record<string, string | number | boolean> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (BLOCKED_KEY_PATTERN.test(key)) continue;
    const safe = sanitizeValue(value);
    if (safe === null) continue;
    out[key] = safe;
  }
  return out;
}
