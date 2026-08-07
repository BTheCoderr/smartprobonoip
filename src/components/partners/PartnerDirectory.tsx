"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics/client";
import { PartnerCard } from "@/components/partners/PartnerCard";
import {
  filterPartners,
  formatAudience,
  formatPartnerAvailability,
  formatPartnerOrgType,
  formatServiceCategory,
  getDirectoryFilterOptions,
  type PartnerDirectoryFilters,
  type PublicPartnerView,
} from "@/lib/routing";
import { PARTNER_DIRECTORY_COPY } from "@/lib/copy";

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-semibold text-navy-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-navy-800"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PartnerDirectory({
  partners,
}: {
  partners: PublicPartnerView[];
}) {
  const filterOptions = useMemo(
    () => getDirectoryFilterOptions(partners),
    [partners],
  );

  const [filters, setFilters] = useState<PartnerDirectoryFilters>({
    query: "",
    orgType: undefined,
    location: undefined,
    serviceCategory: undefined,
    audience: undefined,
    availability: undefined,
  });

  const filtered = useMemo(
    () => filterPartners(partners, filters),
    [partners, filters],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (filters.query?.trim()) {
        trackEvent("partner_search_used", {
          metadata: { resultCount: filtered.length },
        });
      }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [filters.query, filtered.length]);

  function updateFilter<K extends keyof PartnerDirectoryFilters>(
    key: K,
    value: PartnerDirectoryFilters[K],
    filterType: string,
  ) {
    setFilters((current) => ({ ...current, [key]: value || undefined }));
    if (value) {
      trackEvent("partner_filter_applied", {
        metadata: {
          filterType,
          ...(key === "orgType" && value
            ? { organizationType: String(value) }
            : {}),
          ...(key === "serviceCategory" && value
            ? { serviceCategory: String(value) }
            : {}),
          resultCount: filterPartners(partners, {
            ...filters,
            [key]: value || undefined,
          }).length,
        },
      });
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-navy-600">
        {PARTNER_DIRECTORY_COPY.verificationNote}
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <aside className="space-y-4 rounded-xl border border-mist-200 bg-mist-50/60 p-4">
          <label className="block text-xs">
            <span className="mb-1 block font-semibold text-navy-700">
              {PARTNER_DIRECTORY_COPY.searchLabel}
            </span>
            <input
              type="search"
              value={filters.query ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder={PARTNER_DIRECTORY_COPY.searchPlaceholder}
              className="w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-navy-800"
            />
          </label>

          <FilterSelect
            label="Organization type"
            value={filters.orgType ?? ""}
            onChange={(value) =>
              updateFilter(
                "orgType",
                value as PartnerDirectoryFilters["orgType"],
                "orgType",
              )
            }
            options={filterOptions.orgTypes.map((orgType) => ({
              value: orgType,
              label: formatPartnerOrgType(orgType),
            }))}
          />

          <FilterSelect
            label="Location"
            value={filters.location ?? ""}
            onChange={(value) => updateFilter("location", value, "location")}
            options={filterOptions.locations.map((location) => ({
              value: location,
              label: location,
            }))}
          />

          <FilterSelect
            label="Services"
            value={filters.serviceCategory ?? ""}
            onChange={(value) =>
              updateFilter("serviceCategory", value, "serviceCategory")
            }
            options={filterOptions.serviceCategories.map((category) => ({
              value: category,
              label: formatServiceCategory(category),
            }))}
          />

          <FilterSelect
            label="Audience"
            value={filters.audience ?? ""}
            onChange={(value) => updateFilter("audience", value, "audience")}
            options={filterOptions.audiences.map((audience) => ({
              value: audience,
              label: formatAudience(audience),
            }))}
          />

          <FilterSelect
            label={PARTNER_DIRECTORY_COPY.availability}
            value={filters.availability ?? ""}
            onChange={(value) =>
              updateFilter(
                "availability",
                value as PartnerDirectoryFilters["availability"],
                "availability",
              )
            }
            options={filterOptions.availabilities.map((availability) => ({
              value: availability,
              label: formatPartnerAvailability(availability),
            }))}
          />

          {(filters.query ||
            filters.orgType ||
            filters.location ||
            filters.serviceCategory ||
            filters.audience ||
            filters.availability) && (
            <button
              type="button"
              onClick={() =>
                setFilters({
                  query: "",
                  orgType: undefined,
                  location: undefined,
                  serviceCategory: undefined,
                  audience: undefined,
                  availability: undefined,
                })
              }
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Clear filters
            </button>
          )}
        </aside>

        <div>
          <p className="mb-4 text-xs text-navy-500">
            Showing {filtered.length} verified partner
            {filtered.length === 1 ? "" : "s"}
          </p>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-mist-200 bg-white p-6 text-sm text-navy-600">
              {PARTNER_DIRECTORY_COPY.emptyResults}
            </p>
          ) : (
            <ul className="grid gap-4">
              {filtered.map((partner) => (
                <li key={partner.id}>
                  <PartnerCard partner={partner} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-navy-500">
        {PARTNER_DIRECTORY_COPY.boundaryNote}{" "}
        <Link href="/learn" className="link-brand font-semibold">
          Learn IP basics
        </Link>
      </p>
    </div>
  );
}
