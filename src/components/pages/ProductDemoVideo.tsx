"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { TrackedNavLink } from "@/components/analytics/TrackedNavLink";
import { StampLabel } from "@/components/ui/design";
import { trackEvent } from "@/lib/analytics/client";
import {
  PRODUCT_DEMO_VIDEO,
  productDemoEmbedSrc,
  productDemoThumbnailSrc,
} from "@/lib/content/productDemo";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * Click-to-load privacy-enhanced YouTube demo.
 * Loads youtube-nocookie.com only after an explicit play click.
 * Analytics metadata is limited to pageSection / video id — never invention content.
 */
export function ProductDemoVideo({
  pageSection = "product_demo",
}: {
  pageSection?: string;
}) {
  const labelId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const viewedRef = useRef(false);
  const completedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      if (!viewedRef.current) {
        viewedRef.current = true;
        trackEvent("product_demo_viewed", {
          metadata: {
            pageSection,
            videoId: PRODUCT_DEMO_VIDEO.youtubeId,
          },
        });
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || viewedRef.current) return;
        viewedRef.current = true;
        trackEvent("product_demo_viewed", {
          metadata: {
            pageSection,
            videoId: PRODUCT_DEMO_VIDEO.youtubeId,
          },
        });
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [pageSection]);

  useEffect(() => {
    if (!playing) return;

    function onMessage(event: MessageEvent) {
      if (
        typeof event.origin !== "string" ||
        !event.origin.includes("youtube-nocookie.com")
      ) {
        return;
      }

      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;

      const payload = data as { event?: string; info?: number | string };
      // YouTube player state 0 = ended
      if (payload.event === "onStateChange" && Number(payload.info) === 0) {
        if (completedRef.current) return;
        completedRef.current = true;
        trackEvent("product_demo_completed", {
          metadata: {
            pageSection,
            videoId: PRODUCT_DEMO_VIDEO.youtubeId,
          },
        });
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [pageSection, playing]);

  const startPlayback = useCallback(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    setEmbedSrc(productDemoEmbedSrc(origin));
    setPlaying(true);
    trackEvent("product_demo_started", {
      metadata: {
        pageSection,
        videoId: PRODUCT_DEMO_VIDEO.youtubeId,
      },
    });
  }, [pageSection]);

  return (
    <section
      ref={rootRef}
      aria-labelledby={labelId}
      className="product-demo-video"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StampLabel tone="teal">PRODUCT DEMO</StampLabel>
        <p className="section-kicker text-teal-700">
          {PRODUCT_DEMO_VIDEO.kicker}
        </p>
      </div>
      <h2
        id={labelId}
        className="headline-editorial mt-3 text-2xl text-navy-900 sm:text-3xl"
      >
        {PRODUCT_DEMO_VIDEO.headline}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-600 sm:text-base">
        {PRODUCT_DEMO_VIDEO.lead}
      </p>

      <div className="mt-6 overflow-hidden rounded-md border border-mist-200/90 bg-navy-950 shadow-[var(--shadow-paper)]">
        <div className="relative aspect-video w-full bg-navy-900">
          {playing && embedSrc ? (
            <iframe
              title={PRODUCT_DEMO_VIDEO.title}
              src={embedSrc}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <button
              type="button"
              onClick={startPlayback}
              className="group absolute inset-0 flex h-full w-full items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
              aria-label={PRODUCT_DEMO_VIDEO.playLabel}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail; avoid image config for one asset */}
              <img
                src={productDemoThumbnailSrc()}
                alt=""
                className={`h-full w-full object-cover opacity-90 ${
                  reducedMotion ? "" : "transition group-hover:opacity-100"
                }`}
                loading="lazy"
                decoding="async"
              />
              <span className="absolute inset-0 bg-navy-950/35" aria-hidden />
              <span
                className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-white shadow-[var(--shadow-btn)] ${
                  reducedMotion
                    ? ""
                    : "transition group-hover:scale-105 group-hover:bg-teal-500"
                }`}
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  className="ml-1 h-7 w-7 fill-current"
                  aria-hidden
                >
                  <path d="M8 5.14v13.72L19 12 8 5.14Z" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-navy-500">
        {PRODUCT_DEMO_VIDEO.privacyNote}
      </p>

      <div className="mt-6">
        <TrackedNavLink
          href={PRODUCT_DEMO_VIDEO.ctaHref}
          event="pilot_cta_clicked"
          metadata={{
            ctaName: "become_pilot_partner",
            pageSection,
            videoId: PRODUCT_DEMO_VIDEO.youtubeId,
          }}
          className="btn-primary"
        >
          {PRODUCT_DEMO_VIDEO.ctaLabel}
        </TrackedNavLink>
      </div>
    </section>
  );
}
