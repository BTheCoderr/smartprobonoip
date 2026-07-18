/** Shared HTTP security headers for Netlify / Next.js production. */

const GTM_SCRIPT =
  "https://www.googletagmanager.com https://tagmanager.google.com https://www.google-analytics.com";
const GTM_CONNECT =
  "https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://region1.google-analytics.com";
const YOUTUBE =
  "https://www.youtube-nocookie.com https://i.ytimg.com https://www.youtube.com";

/**
 * Report-Only CSP first so GTM / GA4 / YouTube demo / Next assets can be tuned
 * without breaking production. Promote to enforcing CSP after Report-Only is clean.
 */
export const CSP_REPORT_ONLY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${GTM_SCRIPT}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${GTM_CONNECT} ${YOUTUBE}`,
  "font-src 'self' data:",
  `connect-src 'self' ${GTM_CONNECT} https://*.supabase.co wss://*.supabase.co`,
  `frame-src https://www.googletagmanager.com https://www.youtube-nocookie.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy-Report-Only": CSP_REPORT_ONLY,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "X-Frame-Options": "DENY",
};

/** HSTS for HTTPS hosts only (browsers ignore localhost). */
export const HSTS_HEADER =
  "max-age=63072000; includeSubDomains; preload";

export function applySecurityHeaders(
  headers: Headers,
  options?: { includeHsts?: boolean },
): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  if (options?.includeHsts !== false) {
    headers.set("Strict-Transport-Security", HSTS_HEADER);
  }
}
