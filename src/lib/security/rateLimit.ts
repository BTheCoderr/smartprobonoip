import "server-only";
import { NextResponse } from "next/server";

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

export function enforceRateLimit(
  request: Request,
  routeKey: string,
  config: RateLimitConfig,
  sessionKey?: string | null,
): NextResponse | null {
  const ip = getClientIp(request);
  const key = sessionKey
    ? `${routeKey}:session:${sessionKey}`
    : `${routeKey}:ip:${ip}`;
  const result = checkRateLimit(key, config);
  if (result.allowed) return null;

  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSec ?? 60),
      },
    },
  );
}

export const RATE_LIMITS = {
  generate: { limit: 12, windowMs: 15 * 60_000 },
  coach: { limit: 24, windowMs: 15 * 60_000 },
  compareReference: { limit: 40, windowMs: 15 * 60_000 },
  recoveryCreate: { limit: 6, windowMs: 60 * 60_000 },
  recoveryClaim: { limit: 24, windowMs: 60 * 60_000 },
  feedback: { limit: 12, windowMs: 60 * 60_000 },
  research: { limit: 80, windowMs: 60 * 60_000 },
  analytics: { limit: 150, windowMs: 15 * 60_000 },
  partner: { limit: 40, windowMs: 15 * 60_000 },
  interest: { limit: 6, windowMs: 60 * 60_000 },
  timeline: { limit: 30, windowMs: 15 * 60_000 },
} as const;
