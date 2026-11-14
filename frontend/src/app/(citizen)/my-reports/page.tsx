"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FilterX,
  Loader2,
  MapPin,
  RotateCw,
  Search,
  Siren,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EmptyState } from "@/components/shared/empty-state";
import {
  IncidentStatusBadge,
  SeverityBadge,
} from "@/components/shared/incident-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyIncidents } from "@/hooks/use-my-incidents";
import { formatShortDateTime } from "@/lib/format";
import {
  INCIDENT_CATEGORIES,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_STATUSES,
  INCIDENT_STATUS_LABELS,
  type IncidentCategory,
  type IncidentStatus,
} from "@/types/incident";

type CategoryFilter = IncidentCategory | "all";
type StatusFilter = IncidentStatus | "all";

export default function MyReportsPage() {
  const { incidents, loading, error, refresh } = useMyIncidents();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredIncidents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesCategory =
        categoryFilter === "all" || incident.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || incident.status === statusFilter;

      const matchesQuery =
        normalizedQuery.length === 0 ||
        incident.reportId.toLowerCase().includes(normalizedQuery) ||
        incident.location.label.toLowerCase().includes(normalizedQuery) ||
        INCIDENT_CATEGORY_LABELS[incident.category]
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesStatus && matchesQuery;
    });
  }, [incidents, query, categoryFilter, statusFilter]);

  const hasFilters =
    query.trim().length > 0 ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  return (
    <DashboardLayout role="citizen">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              My reports
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every report submitted by this account, with its latest recorded
              status. Internal officer notes are never shown here.
            </p>
          </div>

          <Button asChild size="lg" className="shrink-0">
            <Link href="/report-incident">
              <Siren />
              Report an incident
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Find a report</CardTitle>
            <CardDescription>
              Search by report ID or location, or narrow the list by category
              and status.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  aria-label="Search your reports"
                  placeholder="Search report ID or location"
                  className="h-10 pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <Select
                value={categoryFilter}
                onValueChange={(value) =>
                  setCategoryFilter(value as CategoryFilter)
                }
              >
                <SelectTrigger className="h-10 w-full" aria-label="Filter by category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {INCIDENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {INCIDENT_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger className="h-10 w-full" aria-label="Filter by status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {INCIDENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {INCIDENT_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={clearFilters}
                disabled={!hasFilters}
              >
                <FilterX />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div
            className="space-y-3"
            role="status"
            aria-live="polite"
            aria-label="Loading your reports"
          >
            {[0, 1, 2].map((item) => (
              <Card key={item}>
                <CardContent className="space-y-3 p-5">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-64 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-52 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium">Could not load your reports</p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {error}
                </p>
              </div>
              <Button onClick={() => void refresh()}>
                <RotateCw />
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No reports yet"
            description="When you report an incident, it will appear here with its report ID and current status."
            action={
              <Button asChild>
                <Link href="/report-incident">
                  <Siren />
                  Report your first incident
                </Link>
              </Button>
            }
          />
        ) : filteredIncidents.length === 0 ? (
          <EmptyState
            icon={FilterX}
            title="No reports match these filters"
            description="Try a different search term, category or status."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <section aria-label="Your reports" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Showing {filteredIncidents.length} of {incidents.length}{" "}
              {incidents.length === 1 ? "report" : "reports"}.
            </p>

            <ul className="space-y-3">
              {filteredIncidents.map((incident) => (
                <li key={incident.id}>
                  <Card className="transition-colors hover:border-primary/30">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">
                              {INCIDENT_CATEGORY_LABELS[incident.category]}
                            </p>
                            <IncidentStatusBadge status={incident.status} />
                            <SeverityBadge severity={incident.severity} />
                          </div>

                          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {incident.location.label}
                            </span>
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {incident.reportId} · Submitted{" "}
                            {formatShortDateTime(incident.createdAt)}
                          </p>
                        </div>

                        <Button asChild variant="outline" size="sm">
                          <Link href={`/my-reports/${incident.id}`}>
                            View details
                            <ArrowRight />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}

        {loading ? (
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 motion-safe:animate-spin" />
            Loading reports…
          </p>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
