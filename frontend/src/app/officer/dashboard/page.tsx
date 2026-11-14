"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Clock3,
  Map,
  RotateCw,
  ShieldAlert,
  Siren,
  Truck,
  Waypoints,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DemoDataNotice } from "@/components/shared/demo-data-notice";
import { EmptyState } from "@/components/shared/empty-state";
import {
  IncidentStatusBadge,
  SeverityBadge,
} from "@/components/shared/incident-badges";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOfficerDashboard } from "@/hooks/use-officer-dashboard";
import { formatShortDateTime } from "@/lib/format";
import { INCIDENT_CATEGORY_LABELS } from "@/types/incident";

const quickLinks = [
  {
    title: "Incident map",
    description: "Verified reports and demo resource markers.",
    href: "/officer/map",
    icon: Map,
  },
  {
    title: "Resource inventory",
    description: "Seeded demo resource availability.",
    href: "/officer/resources",
    icon: Truck,
  },
  {
    title: "Deployments",
    description: "Officer-confirmed demo assignments.",
    href: "/officer/deployments",
    icon: Waypoints,
  },
];

export default function OfficerDashboardPage() {
  const { data, loading, error, refresh } = useOfficerDashboard();
  const kpis = data?.kpis;
  const recentIncidents = data?.recentIncidents ?? [];

  return (
    <DashboardLayout role="officer">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Officer dashboard</Badge>
              <Badge variant="secondary">Demo operations</Badge>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Incident overview
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Review incoming citizen reports, verify incidents and track the
              status of the response workflow. Every status change is made by an
              authorized demo officer.
            </p>
          </div>

          <Button asChild className="shrink-0">
            <Link href="/officer/incidents">
              <ClipboardList />
              Open incident queue
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <DemoDataNotice>
          Incident counts come from citizen reports saved in the demo database.
          Resource availability is seeded demonstration data and does not
          represent a live fleet.
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
              onClick={() => void refresh()}
            >
              <RotateCw />
              Try again
            </Button>
          </div>
        ) : null}

        <section aria-label="Operational summary">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active incidents"
              value={loading ? "—" : (kpis?.activeIncidents ?? 0)}
              hint="Submitted, under review, verified or dispatched"
              icon={Siren}
            />
            <StatCard
              label="Awaiting verification"
              value={loading ? "—" : (kpis?.awaitingVerification ?? 0)}
              hint="Needs an officer decision"
              icon={Clock3}
              tone="warning"
            />
            <StatCard
              label="High priority"
              value={loading ? "—" : (kpis?.highPriority ?? 0)}
              hint="Active reports assigned high or critical severity"
              icon={AlertTriangle}
              tone="destructive"
            />
            <StatCard
              label="Available resources"
              value={loading ? "—" : (kpis?.availableResources ?? 0)}
              hint="Eligible demo units currently marked available"
              icon={Truck}
              tone="success"
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Recent incident queue</CardTitle>
                <CardDescription>
                  Active demo reports sorted by submission time.
                </CardDescription>
              </div>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/officer/incidents">
                  View all
                  <ArrowRight />
                </Link>
              </Button>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div
                  className="space-y-3"
                  role="status"
                  aria-live="polite"
                  aria-label="Loading recent incidents"
                >
                  {[0, 1, 2, 3].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-72 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : recentIncidents.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="No active incidents"
                  description="New citizen reports will appear in this queue for review."
                />
              ) : (
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
                    {recentIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-mono text-xs">
                          {incident.reportId}
                        </TableCell>
                        <TableCell>
                          {INCIDENT_CATEGORY_LABELS[incident.category]}
                        </TableCell>
                        <TableCell className="max-w-48 truncate text-muted-foreground">
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
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Officer tools</CardTitle>
                <CardDescription>
                  Open the map, seeded inventory and deployment records.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                {quickLinks.map((link) => (
                  <Button
                    key={link.href}
                    asChild
                    variant="outline"
                    className="h-auto w-full justify-start px-3 py-2.5"
                  >
                    <Link href={link.href}>
                      <link.icon className="shrink-0" />
                      <span className="flex min-w-0 flex-col items-start text-left">
                        <span className="font-medium">{link.title}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {link.description}
                        </span>
                      </span>
                      <ArrowRight className="ml-auto shrink-0 text-muted-foreground" />
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demo workflow</CardTitle>
                <CardDescription>
                  The officer remains in control of every decision.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <ShieldAlert
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>
                      Review the report and its evidence, then verify or reject
                      it.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Truck
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>
                      Request ranked demo resource suggestions for verified
                      incidents.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Waypoints
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>
                      Manually confirm a deployment and update the incident
                      status.
                    </span>
                  </li>
                </ol>

                <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  Recommendations are rule-based and explainable. No automatic
                  dispatch or live tracking is part of this prototype.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
