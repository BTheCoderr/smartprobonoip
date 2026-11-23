/**
 * Pure rate-limit core (no Next.js imports) so it can be unit tested.
 */
type Bucket = { count: number; resetAt: number };

/**
 * Process-local sliding window. On Netlify serverless, each isolate has its own
 * Map, so these limits are NOT globally effective across concurrent instances.
 * Prefer a durable shared store (existing Supabase) before claiming global RL.
 */
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (bucket.count >= config.limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}


/**
 * Checks the per-session bucket when a session key is supplied AND a wider
 * per-IP bucket (ipMultiplier x limit). The session id is a client-chosen
 * header, so session-only limits could be bypassed by rotating it; the IP
 * bucket caps that.
 */
export function checkRequestRateLimit(
  request: Request,
  routeKey: string,
  config: RateLimitConfig,
  sessionKey?: string | null,
  ipMultiplier = 3,
): { allowed: boolean; retryAfterSec?: number } {
  const ip = getClientIp(request);
  if (!sessionKey) {
    return checkRateLimit(`${routeKey}:ip:${ip}`, config);
  }
  const ipResult = checkRateLimit(`${routeKey}:ip:${ip}`, {
    limit: config.limit * ipMultiplier,
    windowMs: config.windowMs,
  });
  if (!ipResult.allowed) return ipResult;
  return checkRateLimit(`${routeKey}:session:${sessionKey}`, config);
}

/** Test helper. */
export function resetRateLimitsForTests(): void {
  buckets.clear();
}
