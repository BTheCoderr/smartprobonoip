"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PortfolioSummaryCards } from "@/components/dashboard/PortfolioSummaryCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ReadinessOverview } from "@/components/dashboard/ReadinessOverview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { SavePortfolioCard } from "@/components/dashboard/SavePortfolioCard";
import { WorkspaceHeader } from "@/components/dashboard/WorkspaceHeader";
import { InventionList } from "@/components/portfolio/InventionList";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { trackEvent } from "@/lib/analytics/client";
import type { InventionStatus } from "@/lib/ideas/types";
import {
  clearPortfolioMarker,
  markPortfolioPresent,
} from "@/lib/portfolio/marker";
import { sortInventions } from "@/lib/portfolio/sort";
import type { InventionSortMode, PortfolioSnapshot } from "@/lib/portfolio/types";
import { ROUTES } from "@/lib/routes";
import { getStore } from "@/lib/store";

type LoadState = "loading" | "ready" | "error";

export function InventorWorkspace() {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [sortMode, setSortMode] = useState<InventionSortMode>("recent");
  const [reloadCount, setReloadCount] = useState(0);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let active = true;

    getStore()
      .getPortfolio()
      .then((next) => {
        if (!active) return;
        setSnapshot(next);
        setState("ready");
        // Keep the root-page marker honest: an emptied portfolio should send
        // this browser back to the marketing page.
        if (next.inventions.length > 0) {
          markPortfolioPresent();
        } else {
          clearPortfolioMarker();
        }
        trackEvent("workspace_viewed", {
          metadata: { inventionCount: next.inventions.length },
        });
      })
      .catch(() => {
        if (active) setState("error");
      });

    return () => {
      active = false;
    };
  }, [reloadCount]);

  const sorted = useMemo(
    () => (snapshot ? sortInventions(snapshot.inventions, sortMode) : []),
    [snapshot, sortMode],
  );

  const mostRecent = useMemo(
    () => sortInventions(snapshot?.inventions ?? [], "recent")[0] ?? null,
    [snapshot],
  );

  const handleStatusChange = useCallback(
    async (id: string, status: InventionStatus) => {
      await getStore().updateInvention(id, { status });
      trackEvent("invention_status_changed", {
        projectId: id,
        metadata: { label: status },
      });
      reload();
    },
    [reload],
  );

  const handleSortModeChange = useCallback((mode: InventionSortMode) => {
    setSortMode(mode);
    trackEvent("portfolio_sorted", { metadata: { sortMode: mode } });
  }, []);

  if (state === "loading") {
    return (
      <div className="page-shell py-16" aria-busy="true">
        <p className="text-sm text-navy-500">Loading your workspace…</p>
      </div>
    );
  }

  if (state === "error" || !snapshot) {
    return (
      <div className="page-shell py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">
          We could not load your workspace
        </h1>
        <p className="mt-2 text-sm text-navy-500">
          Your inventions are safe. Refresh to try again, or open a packet
          directly if you have its link.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setState("loading");
              reload();
            }}
            className="btn-primary"
          >
            Try again
          </button>
          <Link href={ROUTES.recover} className="btn-secondary">
            Use a recovery link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-10 sm:py-14">
      <WorkspaceHeader summary={snapshot.summary} />

      <div className="space-y-8">
        <PortfolioSummaryCards summary={snapshot.summary} />

        <QuickActions mostRecent={mostRecent} />

        <InventionList
          inventions={sorted}
          sortMode={sortMode}
          onSortModeChange={handleSortModeChange}
          onStatusChange={handleStatusChange}
        />

        {snapshot.inventions.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivity events={snapshot.recentActivity} />
            </div>
            <div className="space-y-6">
              <ReadinessOverview summary={snapshot.summary} />
              <RecentDocuments documents={snapshot.recentDocuments} />
            </div>
          </div>
        ) : null}

        {mostRecent ? (
          <SavePortfolioCard
            anchorInventionId={mostRecent.id}
            inventionCount={snapshot.inventions.length}
          />
        ) : null}

        <DisclaimerNotice />
      </div>
    </div>
  );
}
