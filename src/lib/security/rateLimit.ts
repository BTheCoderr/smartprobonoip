import "server-only";
import { NextResponse } from "next/server";

import {
  checkRequestRateLimit,
  type RateLimitConfig,
} from "./rateLimitCore";

export { checkRateLimit, getClientIp, type RateLimitConfig } from "./rateLimitCore";

export function enforceRateLimit(
  request: Request,
  routeKey: string,
  config: RateLimitConfig,
  sessionKey?: string | null,
): NextResponse | null {
  const result = checkRequestRateLimit(request, routeKey, config, sessionKey);
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
