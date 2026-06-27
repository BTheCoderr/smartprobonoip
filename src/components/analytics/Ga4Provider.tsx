"use client";

import Script from "next/script";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureCampaignAttribution } from "@/lib/analytics/campaignAttribution";
import { ga4MeasurementId, trackGa4PageView } from "@/lib/analytics/ga4";

const CONSENT_KEY = "smartprobonoip:analytics-notice";

function CampaignCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    captureCampaignAttribution(query ? `?${query}` : "");
  }, [searchParams]);

  return null;
}

function Ga4RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackGa4PageView(pathname);
  }, [pathname]);

  return null;
}

function readNoticeVisible(): boolean {
  if (!ga4MeasurementId()) return false;
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
          We use Google Analytics on public pages to understand traffic and campaign
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

export function Ga4Provider() {
  const measurementId = ga4MeasurementId();
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <CampaignCapture />
        <Ga4RouteTracker />
      </Suspense>
      <AnalyticsNotice />
    </>
  );
}
