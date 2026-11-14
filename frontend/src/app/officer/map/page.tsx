"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Layers,
  MapPin,
  RotateCw,
  Truck,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DemoDataNotice } from "@/components/shared/demo-data-notice";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficerIncidents } from "@/hooks/use-officer-incidents";
import { useOfficerResources } from "@/hooks/use-officer-resources";
import {
  INCIDENT_CATEGORY_LABELS,
  RESOURCE_AVAILABILITY_LABELS,
  RESOURCE_TYPE_LABELS,
  type IncidentStatus,
} from "@/types/incident";

const IncidentMap = dynamic(
  () =>
    import("@/components/officer/incident-map").then(
      (module) => module.IncidentMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    ),
  }
);

const MAPPED_STATUSES: IncidentStatus[] = [
  "verified",
  "dispatched",
  "resolved",
];

const legendIncidents: { label: string; className: string }[] = [
  { label: "Verified", className: "bg-blue-600" },
  { label: "Dispatched", className: "bg-violet-600" },
  { label: "Resolved", className: "bg-emerald-600" },
];

const legendResources: { label: string; className: string }[] = [
  { label: "Available", className: "bg-emerald-600" },
  { label: "Deployed", className: "bg-violet-600" },
  { label: "Unavailable", className: "bg-slate-500" },
];

export default function OfficerMapPage() {
  const {
    incidents,
    loading: incidentsLoading,
    error: incidentsError,
    refresh: refreshIncidents,
  } = useOfficerIncidents();
  const {
    resources,
    loading: resourcesLoading,
    error: resourcesError,
    refresh: refreshResources,
  } = useOfficerResources();

  const loading = incidentsLoading || resourcesLoading;
  const error = incidentsError ?? resourcesError;
  const mappedIncidents = incidents.filter(
    (incident) =>
      MAPPED_STATUSES.includes(incident.status) &&
      incident.location.latitude !== undefined &&
      incident.location.longitude !== undefined
  );
  const mappedResources = resources.filter(
    (resource) =>
      resource.location.latitude !== undefined &&
      resource.location.longitude !== undefined
  );

  const refreshAll = () => {
    void Promise.all([refreshIncidents(), refreshResources()]);
  };

  return (
    <DashboardLayout role="officer">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Officer map</Badge>
              <Badge variant="secondary">Simulated geography</Badge>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Incident and resource map
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Verified, dispatched and resolved demo incidents alongside seeded
              resource base locations in Greater Noida.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={refreshAll}
            disabled={loading}
            className="shrink-0"
          >
            <RotateCw />
            Refresh map data
          </Button>
        </div>

        <DemoDataNotice>
          Incidents come from reports saved in the demo database. Resource
          locations are seeded base locations, not live vehicle positions. Map
          background tiles are provided by OpenStreetMap.
        </DemoDataNotice>

        {error ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {error}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={refreshAll}
            >
              <RotateCw />
              Try again
            </Button>
          </div>
        ) : null}

        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  Officer map
                </CardTitle>
                <CardDescription>
                  Select a marker to inspect its report or resource base.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {legendIncidents.map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5">
                    <span
                      className={`size-2.5 rounded-full ${item.className}`}
                      aria-hidden="true"
                    />
                    {item.label} report
                  </span>
                ))}
                {legendResources.map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5">
                    <span
                      className={`size-2.5 rounded-full ring-2 ring-background ring-inset ${item.className}`}
                      aria-hidden="true"
                    />
                    {item.label} resource
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="relative h-[28rem] w-full">
              {loading ? (
                <Skeleton className="h-full w-full rounded-none" />
              ) : (
                <IncidentMap
                  incidents={mappedIncidents}
                  resources={mappedResources}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-xs leading-relaxed text-muted-foreground">
          The map is illustrative and uses OpenStreetMap tiles. If tiles fail to
          load, the lists below remain available. No road routing, live tracking
          or travel times are provided.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mapped incidents</CardTitle>
              <CardDescription>
                {mappedIncidents.length}{" "}
                {mappedIncidents.length === 1 ? "report" : "reports"} with
                coordinates.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <Skeleton key={item} className="h-16 w-full" />
                  ))}
                </div>
              ) : mappedIncidents.length === 0 ? (
                <EmptyState
                  icon={MapPin}
                  title="No mapped incidents"
                  description="Verified reports with coordinates will appear here."
                  className="py-8"
                />
              ) : (
                <ul className="space-y-3">
                  {mappedIncidents.map((incident) => (
                    <li
                      key={incident.id}
                      className="rounded-xl border p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/officer/incidents/${incident.id}`}
                          className="font-mono text-xs font-medium underline-offset-4 hover:underline"
                        >
                          {incident.reportId}
                        </Link>
                        <IncidentStatusBadge status={incident.status} />
                        <SeverityBadge severity={incident.severity} />
                      </div>

                      <p className="mt-2 text-sm font-medium">
                        {INCIDENT_CATEGORY_LABELS[incident.category]}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {incident.location.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {incident.location.latitude?.toFixed(5)},{" "}
                        {incident.location.longitude?.toFixed(5)}
                      </p>

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="-ml-2 mt-2"
                      >
                        <Link href={`/officer/incidents/${incident.id}`}>
                          Open report
                          <ArrowRight />
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="size-4 text-primary" />
                Resource bases
              </CardTitle>
              <CardDescription>
                {mappedResources.length} seeded demo{" "}
                {mappedResources.length === 1 ? "base" : "bases"} with
                coordinates.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <Skeleton key={item} className="h-16 w-full" />
                  ))}
                </div>
              ) : mappedResources.length === 0 ? (
                <EmptyState
                  icon={Truck}
                  title="No mapped resources"
                  description="Seeded resource bases with coordinates will appear here."
                  className="py-8"
                />
              ) : (
                <ul className="space-y-3">
                  {mappedResources.map((resource) => (
                    <li key={resource.id} className="rounded-xl border p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{resource.name}</p>
                        <Badge variant="outline" className="font-mono text-xs">
                          {resource.resourceCode}
                        </Badge>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {RESOURCE_TYPE_LABELS[resource.type]} ·{" "}
                        {RESOURCE_AVAILABILITY_LABELS[resource.availability]}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {resource.location.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {resource.location.latitude?.toFixed(5)},{" "}
                        {resource.location.longitude?.toFixed(5)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
