/**
 * Marks that this browser has at least one saved invention, so the server can
 * redirect returning inventors from `/` to their workspace before anything
 * renders. The value is a constant flag — it carries no identifier and is not
 * used for authorization, which still comes from the pilot session header on
 * every request.
 */
export const PORTFOLIO_MARKER_COOKIE = "spb_has_portfolio";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

export function markPortfolioPresent(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${PORTFOLIO_MARKER_COOKIE}=1; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearPortfolioMarker(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${PORTFOLIO_MARKER_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
