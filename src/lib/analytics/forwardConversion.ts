import "server-only";
import { buildMeasurementProtocolRequest, gaClientIdFromCookie } from "./measurementProtocol";

const TIMEOUT_MS = 1500;

/**
 * Best-effort GA4 Measurement Protocol forward for private-page conversions.
 * Requires NEXT_PUBLIC_GA4_MEASUREMENT_ID and the server-only GA4_API_SECRET.
 * Never throws; never blocks the response for more than TIMEOUT_MS.
 */
export async function forwardPrivateConversion(
  request: Request,
  eventName: string,
  metadata?: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const mp = buildMeasurementProtocolRequest({
    eventName,
    clientId: gaClientIdFromCookie(request.headers.get("cookie")),
    metadata,
    measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    apiSecret: process.env.GA4_API_SECRET,
  });
  if (!mp) return false;
  try {
    const res = await fetchImpl(mp.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mp.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}
