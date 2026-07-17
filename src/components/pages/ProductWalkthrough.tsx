"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { TrackedNavLink } from "@/components/analytics/TrackedNavLink";
import { StampLabel } from "@/components/ui/design";
import { trackEvent } from "@/lib/analytics/client";
import {
  PRODUCT_WALKTHROUGH_COPY,
  PRODUCT_WALKTHROUGH_STEPS,
} from "@/lib/content/productWalkthrough";

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

export function ProductWalkthrough({
  pageSection = "product_walkthrough",
}: {
  pageSection?: string;
}) {
  const labelId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);
  const viewedRef = useRef(false);
  const steppedRef = useRef<Set<number>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const active = PRODUCT_WALKTHROUGH_STEPS[activeIndex];

  const trackStep = useCallback(
    (index: number) => {
      const step = PRODUCT_WALKTHROUGH_STEPS[index];
      if (!step || steppedRef.current.has(step.step)) return;
      steppedRef.current.add(step.step);
      trackEvent("product_walkthrough_step_viewed", {
        metadata: {
          stepNumber: step.step,
          stepName: step.id,
          pageSection,
          totalSteps: PRODUCT_WALKTHROUGH_STEPS.length,
        },
      });
    },
    [pageSection],
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      if (!viewedRef.current) {
        viewedRef.current = true;
        trackEvent("product_walkthrough_viewed", {
          metadata: { pageSection },
        });
        trackStep(0);
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || viewedRef.current) return;
        viewedRef.current = true;
        trackEvent("product_walkthrough_viewed", {
          metadata: { pageSection },
        });
        trackStep(0);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [pageSection, trackStep]);

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(
        0,
        Math.min(PRODUCT_WALKTHROUGH_STEPS.length - 1, index),
      );
      setActiveIndex(next);
      trackStep(next);

      const scroller = mobileScrollerRef.current;
      if (scroller) {
        const child = scroller.children[next] as HTMLElement | undefined;
        if (child) {
          scroller.scrollTo({
            left: child.offsetLeft,
            behavior: reducedMotion ? "auto" : "smooth",
          });
        }
      }
    },
    [reducedMotion, trackStep],
  );

  useEffect(() => {
    const scroller = mobileScrollerRef.current;
    if (!scroller) return;

    const onScroll = () => {
      const width = scroller.clientWidth || 1;
      const index = Math.round(scroller.scrollLeft / width);
      const clamped = Math.max(
        0,
        Math.min(PRODUCT_WALKTHROUGH_STEPS.length - 1, index),
      );
      setActiveIndex((prev) => {
        if (prev === clamped) return prev;
        trackStep(clamped);
        return clamped;
      });
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [trackStep]);

  return (
    <section
      ref={rootRef}
      aria-labelledby={labelId}
      className="product-walkthrough"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StampLabel tone="teal">WALKTHROUGH</StampLabel>
        <p className="section-kicker text-teal-700">
          {PRODUCT_WALKTHROUGH_COPY.kicker}
        </p>
      </div>
      <h2
        id={labelId}
        className="headline-editorial mt-3 text-2xl text-navy-900 sm:text-3xl"
      >
        {PRODUCT_WALKTHROUGH_COPY.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-600 sm:text-base">
        {PRODUCT_WALKTHROUGH_COPY.lead}
      </p>

      {/* Desktop: numbered tabs + one large screenshot */}
      <div className="mt-8 hidden lg:block">
        <div
          role="tablist"
          aria-label="Product walkthrough steps"
          className="flex flex-wrap gap-2"
        >
          {PRODUCT_WALKTHROUGH_STEPS.map((step, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`walkthrough-panel-${step.id}`}
                id={`walkthrough-tab-${step.id}`}
                onClick={() => goTo(index)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "border-teal-500 bg-teal-50 text-navy-900 shadow-[var(--shadow-soft)]"
                    : "border-mist-200 bg-white text-navy-600 hover:border-teal-200 hover:bg-cream"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    selected
                      ? "bg-teal-600 text-white"
                      : "bg-navy-100 text-navy-700"
                  }`}
                >
                  {step.step}
                </span>
                <span className="font-medium">{step.title}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`walkthrough-panel-${active.id}`}
          aria-labelledby={`walkthrough-tab-${active.id}`}
          className="mt-5"
        >
          <div className="overflow-hidden rounded-md border border-mist-200/90 bg-white shadow-[var(--shadow-paper)]">
            <div className="relative aspect-[16/10] w-full bg-mist-50">
              <Image
                key={active.imageSrc}
                src={active.imageSrc}
                alt={active.imageAlt}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className={`object-contain object-top ${
                  reducedMotion
                    ? ""
                    : "motion-safe:animate-[fadeIn_280ms_ease-out]"
                }`}
                loading="lazy"
              />
            </div>
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-900">
                Step {active.step}: {active.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-navy-600">
                {active.caption}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                disabled={activeIndex === 0}
                aria-label={PRODUCT_WALKTHROUGH_COPY.previousLabel}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-mist-300 bg-white text-navy-700 transition hover:border-teal-300 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                disabled={activeIndex === PRODUCT_WALKTHROUGH_STEPS.length - 1}
                aria-label={PRODUCT_WALKTHROUGH_COPY.nextLabel}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-mist-300 bg-white text-navy-700 transition hover:border-teal-300 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: swipeable carousel */}
      <div className="mt-8 lg:hidden">
        <div
          ref={mobileScrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Product walkthrough carousel"
        >
          {PRODUCT_WALKTHROUGH_STEPS.map((step) => (
            <article
              key={step.id}
              className="w-[88%] shrink-0 snap-center sm:w-[80%]"
            >
              <div className="overflow-hidden rounded-md border border-mist-200/90 bg-white shadow-[var(--shadow-paper)]">
                <div className="relative aspect-[4/3] w-full bg-mist-50">
                  <Image
                    src={step.imageSrc}
                    alt={step.imageAlt}
                    fill
                    sizes="(max-width: 1023px) 88vw, 640px"
                    className="object-contain object-top"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-teal-700">
                Step {step.step}
              </p>
              <p className="mt-1 text-sm font-semibold text-navy-900">
                {step.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-navy-600">
                {step.caption}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          {PRODUCT_WALKTHROUGH_STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              aria-label={`Go to step ${step.step}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => goTo(index)}
              className={`h-2.5 rounded-full transition ${
                index === activeIndex
                  ? "w-6 bg-teal-600"
                  : "w-2.5 bg-navy-200 hover:bg-navy-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <TrackedNavLink
          href={PRODUCT_WALKTHROUGH_COPY.ctaHref}
          event="pilot_cta_clicked"
          metadata={{
            ctaName: "become_pilot_partner",
            pageSection,
            stepNumber: active.step,
            stepName: active.id,
          }}
          className="btn-primary"
        >
          {PRODUCT_WALKTHROUGH_COPY.ctaLabel}
        </TrackedNavLink>
      </div>
    </section>
  );
}
