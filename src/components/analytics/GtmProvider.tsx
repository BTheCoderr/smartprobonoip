"use client";

import Script from "next/script";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureCampaignAttribution } from "@/lib/analytics/campaignAttribution";
import {
  ga4MeasurementId,
  gtmContainerId,
  publicGtmPaths,
  shouldLoadGtm,
  trackGtmPageView,
} from "@/lib/analytics/gtm";
import { buildGtmBootstrapScript } from "@/lib/analytics/gtmGuard";

const CONSENT_KEY = "smartprobonoip:analytics-notice";

function CampaignCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    captureCampaignAttribution(query ? `?${query}` : "");
  }, [searchParams]);

  return null;
}

function GtmRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackGtmPageView(pathname);
  }, [pathname]);

  return null;
}

/**
 * If GTM was loaded on a public page and the visitor then navigates in-app to
 * a private route, switch GA4 collection off with Google's documented
 * `ga-disable-<measurement id>` flag, and back on when they return.
 */
function PrivateRouteGuard({ pathname }: { pathname: string | null }) {
  useEffect(() => {
    const id = ga4MeasurementId();
    if (!id) return;
    (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] =
      !shouldLoadGtm(pathname);
  }, [pathname]);
  return null;
}

function readNoticeVisible(): boolean {
  if (!gtmContainerId()) return false;
  try {
    return !window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return true;
  }
}

function AnalyticsNotice() {
  const [dismissed, setDismissed] = useState(false);
  const shouldShow = useSyncExternalStore(
    () => () => {},
    readNoticeVisible,
    () => false,
  );
  const visible = shouldShow && !dismissed;

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-mist-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-navy-700">
          We use Google Tag Manager on public pages to understand traffic and campaign
          performance. We do not send your invention details or private packet content
          to Google Analytics.
        </p>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(CONSENT_KEY, "acknowledged");
            setDismissed(true);
          }}
          className="shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function GtmProvider() {
  const containerId = gtmContainerId();
  const pathname = usePathname();
  if (!containerId) return null;

  // Never inject GTM on private routes. The bootstrap script also turns any
  // in-app navigation from a public page to a private URL into a full page
  // load, so GTM is never in memory while a private URL is in the address bar.
  // PrivateRouteGuard is a second layer (ga-disable flag).
  const allowed = shouldLoadGtm(pathname);

  return (
    <>
      <PrivateRouteGuard pathname={pathname} />
      {allowed ? (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {buildGtmBootstrapScript({
              containerId,
              publicPaths: publicGtmPaths(),
              ga4MeasurementId: ga4MeasurementId(),
            })}
          </Script>
          <Suspense fallback={null}>
            <CampaignCapture />
            <GtmRouteTracker />
          </Suspense>
          <AnalyticsNotice />
        </>
      ) : null}
    </>
  );
}
