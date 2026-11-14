"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FilterX,
  RotateCw,
  Search,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EmptyState } from "@/components/shared/empty-state";
import {
  IncidentStatusBadge,
  SeverityBadge,
} from "@/components/shared/incident-badges";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOfficerIncidents } from "@/hooks/use-officer-incidents";
import { formatShortDateTime } from "@/lib/format";
import {
  INCIDENT_CATEGORIES,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_STATUSES,
  INCIDENT_STATUS_LABELS,
  SEVERITIES,
  SEVERITY_LABELS,
  isAwaitingVerification,
  type IncidentCategory,
  type IncidentStatus,
  type Severity,
} from "@/types/incident";

type StatusFilter = IncidentStatus | "all" | "awaiting";
type CategoryFilter = IncidentCategory | "all";
type SeverityFilter = Severity | "all";

export default function OfficerIncidentsPage() {
  const { incidents, loading, error, refresh } = useOfficerIncidents();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("all");
  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilter>("all");

  const filteredIncidents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "awaiting"
          ? isAwaitingVerification(incident)
          : incident.status === statusFilter);
      const matchesCategory =
        categoryFilter === "all" || incident.category === categoryFilter;
      const matchesSeverity =
        severityFilter === "all" || incident.severity === severityFilter;

      const matchesQuery =
        normalizedQuery.length === 0 ||
        incident.reportId.toLowerCase().includes(normalizedQuery) ||
        incident.location.label.toLowerCase().includes(normalizedQuery) ||
        INCIDENT_CATEGORY_LABELS[incident.category]
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesStatus && matchesCategory && matchesSeverity && matchesQuery
      );
    });
  }, [incidents, query, statusFilter, categoryFilter, severityFilter]);

  const awaitingCount = incidents.filter(isAwaitingVerification).length;

  const hasFilters =
    query.trim().length > 0 ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    severityFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSeverityFilter("all");
  };

  return (
    <DashboardLayout role="officer">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Officer console</Badge>
              <Badge variant="secondary">
                {loading ? "Loading queue" : `${awaitingCount} awaiting review`}
              </Badge>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Incident queue
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Open a report to inspect its evidence, assign an operational
              severity, and record a verification or rejection decision.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter reports</CardTitle>
            <CardDescription>
              Search by report ID or location, then narrow the queue by status,
              category or officer-assigned severity.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem_auto]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  aria-label="Search incident queue"
                  placeholder="Search report ID or location"
                  className="h-10 pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger
                  className="h-10 w-full"
                  aria-label="Filter by status"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="awaiting">Awaiting review</SelectItem>
                  {INCIDENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {INCIDENT_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter}
                onValueChange={(value) =>
                  setCategoryFilter(value as CategoryFilter)
                }
              >
                <SelectTrigger
                  className="h-10 w-full"
                  aria-label="Filter by category"
                >
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
                value={severityFilter}
                onValueChange={(value) =>
                  setSeverityFilter(value as SeverityFilter)
                }
              >
                <SelectTrigger
                  className="h-10 w-full"
                  aria-label="Filter by severity"
                >
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  {SEVERITIES.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {SEVERITY_LABELS[severity]}
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
          <Card>
            <CardContent
              className="space-y-3 p-5"
              role="status"
              aria-live="polite"
              aria-label="Loading incident queue"
            >
              {[0, 1, 2, 3, 4].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="h-4 w-56 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-80 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium">Could not load the incident queue</p>
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
            title="No reports in the queue"
            description="Citizen reports will appear here after they are submitted."
          />
        ) : filteredIncidents.length === 0 ? (
          <EmptyState
            icon={FilterX}
            title="No reports match these filters"
            description="Try a different search term, status, category or severity."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {filteredIncidents.length} of {incidents.length}{" "}
                {incidents.length === 1 ? "report" : "reports"}
              </CardTitle>
              <CardDescription>
                Newest reports are listed first. Internal notes are visible only
                in the report detail.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Link
                          href={`/officer/incidents/${incident.id}`}
                          className="font-mono text-xs font-medium underline-offset-4 hover:underline"
                        >
                          {incident.reportId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {INCIDENT_CATEGORY_LABELS[incident.category]}
                      </TableCell>
                      <TableCell className="max-w-56 truncate text-muted-foreground">
                        {incident.location.label}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatShortDateTime(incident.createdAt)}
                      </TableCell>
                      <TableCell>
                        <SeverityBadge severity={incident.severity} />
                      </TableCell>
                      <TableCell>
                        <IncidentStatusBadge status={incident.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/officer/incidents/${incident.id}`}>
                            {incident.status === "submitted" ||
                            incident.status === "under_review"
                              ? "Review"
                              : "View"}
                            <ArrowRight />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
