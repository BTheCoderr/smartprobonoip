/**
 * Inline bootstrap that keeps Google Tag Manager (and GA4 inside it) off
 * private pages, including after client-side navigation.
 *
 * Runs before gtm.js is requested, so its listeners and history wrappers are
 * installed ahead of GA4's own history-change listeners:
 *
 * 1. If the current URL is not public, GTM is never requested.
 * 2. In-app navigation (history.pushState / replaceState) from a public page
 *    to a private URL becomes a full page load. The address bar never shows
 *    the private URL while GTM is in memory, so GA4 cannot read it.
 * 3. Back/forward (popstate) onto a private URL switches GA4 off
 *    (ga-disable-<id>) and reloads without GTM.
 *
 * "Public" = exact path in the allowlist AND no private query keys
 * (record ids on /start?record=..., recovery tokens).
 */
export const PRIVATE_QUERY_KEYS = ["record", "token", "recordId", "projectId"] as const;

export interface GtmGuardOptions {
  containerId: string;
  publicPaths: readonly string[];
  ga4MeasurementId?: string | null;
}

const SAFE_ID = /^[A-Za-z0-9_-]{1,40}$/;
const SAFE_PATH = /^\/[A-Za-z0-9/_-]{0,200}$/;

export function buildGtmBootstrapScript(options: GtmGuardOptions): string {
  if (!SAFE_ID.test(options.containerId)) {
    throw new Error("Invalid GTM container id");
  }
  const gaId =
    options.ga4MeasurementId && SAFE_ID.test(options.ga4MeasurementId)
      ? options.ga4MeasurementId
      : "";
  const paths = options.publicPaths.filter((p) => SAFE_PATH.test(p));

  return `(function(w,d){
  if (w.__spbGtmGuard) return;
  w.__spbGtmGuard = true;
  var PUBLIC = ${JSON.stringify(paths)};
  var PRIVATE_KEYS = ${JSON.stringify(PRIVATE_QUERY_KEYS)};
  var GA_ID = ${JSON.stringify(gaId)};
  function isPublic(href) {
    var url;
    try { url = new URL(href, w.location.href); } catch (e) { return false; }
    if (url.origin !== w.location.origin) return true;
    var path = url.pathname.length > 1 ? url.pathname.replace(/\\/+$/, "") : url.pathname;
    if (PUBLIC.indexOf(path) === -1) return false;
    for (var i = 0; i < PRIVATE_KEYS.length; i++) {
      if (url.searchParams.has(PRIVATE_KEYS[i])) return false;
    }
    return true;
  }
  function disableGa() { if (GA_ID) { w["ga-disable-" + GA_ID] = true; } }
  w.__spbIsPublicAnalyticsUrl = isPublic;
  if (!isPublic(w.location.href)) { disableGa(); return; }
  function wrap(name) {
    var original = w.history[name];
    w.history[name] = function (state, title, url) {
      if (url !== undefined && url !== null && !isPublic(String(url))) {
        disableGa();
        w.location.assign(new URL(String(url), w.location.href).href);
        return;
      }
      return original.apply(this, arguments);
    };
  }
  wrap("pushState");
  wrap("replaceState");
  w.addEventListener("popstate", function () {
    if (!isPublic(w.location.href)) { disableGa(); w.location.reload(); }
  }, true);
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var f = d.getElementsByTagName("script")[0];
  var j = d.createElement("script");
  j.async = true;
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + ${JSON.stringify(options.containerId)};
  f.parentNode.insertBefore(j, f);
})(window, document);`;
}
