"use client";

import { useId } from "react";
import { InventionCard } from "@/components/portfolio/InventionCard";
import { EmptyPortfolio } from "@/components/portfolio/EmptyPortfolio";
import type { InventionStatus, InventionSummary } from "@/lib/ideas/types";
import { INVENTION_SORT_MODES } from "@/lib/portfolio/sort";
import type { InventionSortMode } from "@/lib/portfolio/types";

export function InventionList({
  inventions,
  sortMode,
  onSortModeChange,
  onStatusChange,
}: {
  inventions: InventionSummary[];
  sortMode: InventionSortMode;
  onSortModeChange: (mode: InventionSortMode) => void;
  onStatusChange?: (id: string, status: InventionStatus) => Promise<void>;
}) {
  const sortFieldId = useId();

  if (inventions.length === 0) {
    return <EmptyPortfolio />;
  }

  return (
    <section aria-labelledby="portfolio-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="portfolio-heading"
          className="text-lg font-semibold tracking-tight text-navy-900"
        >
          Your inventions
          <span className="ml-2 text-sm font-normal text-navy-400">
            {inventions.length}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <label
            htmlFor={sortFieldId}
            className="text-xs font-medium text-navy-500"
          >
            Sort by
          </label>
          <select
            id={sortFieldId}
            value={sortMode}
            onChange={(event) =>
              onSortModeChange(event.target.value as InventionSortMode)
            }
            className="rounded-md border border-mist-200 bg-white px-2 py-1 text-xs font-medium text-navy-700"
          >
            {INVENTION_SORT_MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {inventions.map((invention) => (
          <InventionCard
            key={invention.id}
            invention={invention}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </section>
  );
}
