"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  Phone,
  RotateCw,
  ShieldCheck,
  Siren,
  Truck,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { IncidentStatusBadge } from "@/components/shared/incident-badges";
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
import { useMyIncidents } from "@/hooks/use-my-incidents";
import { formatShortDateTime } from "@/lib/format";
import { getCitizenIncidentSummary } from "@/lib/incidents";
import { INCIDENT_CATEGORY_LABELS } from "@/types/incident";

const emergencyNumbers = [
  { label: "All-in-one emergency", number: "112" },
  { label: "Ambulance", number: "108" },
  { label: "Fire and rescue", number: "101" },
];

const statusSteps = [
  {
    status: "Submitted",
    description: "Your report is recorded in the demo system.",
  },
  {
    status: "Under review",
    description: "A demo officer is checking the details.",
  },
  {
    status: "Verified",
    description: "An officer has accepted it for a demo response.",
  },
  {
    status: "Dispatched",
    description: "A demo resource has been assigned.",
  },
  {
    status: "Resolved",
    description: "The incident has been marked addressed.",
  },
];

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const { incidents, loading, error, refresh } = useMyIncidents();
  const summary = getCitizenIncidentSummary(incidents);
  const recentReports = incidents.slice(0, 4);
  const firstName = user?.name.trim().split(/\s+/)[0];

  return (
    <DashboardLayout role="citizen">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Citizen dashboard</Badge>
              <Badge variant="secondary">Your account only</Badge>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>

            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              Greater Noida, Uttar Pradesh
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Report an incident, follow the status of your reports and find
              preparedness guidance. This prototype does not contact emergency
              services or dispatch real help.
            </p>
          </div>

          <Button asChild size="lg" className="shrink-0">
            <Link href="/report-incident">
              <Siren />
              Report an incident
            </Link>
          </Button>
        </div>

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

        <section aria-label="Your report summary">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total reports"
              value={loading ? "—" : summary.total}
              hint="Reports submitted from this account"
              icon={ClipboardList}
            />
            <StatCard
              label="Awaiting review"
              value={loading ? "—" : summary.awaitingReview}
              hint="Submitted or under officer review"
              icon={Clock3}
              tone="warning"
            />
            <StatCard
              label="In progress"
              value={loading ? "—" : summary.inProgress}
              hint="Verified or dispatched for a demo response"
              icon={Truck}
            />
            <StatCard
              label="Resolved"
              value={loading ? "—" : summary.resolved}
              hint="Marked addressed by an officer"
              icon={CheckCircle2}
              tone="success"
            />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Your recent reports</CardTitle>
                <CardDescription>
                  The latest incidents submitted from this account.
                </CardDescription>
              </div>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/my-reports">
                  View all
                  <ArrowRight />
                </Link>
              </Button>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div
                  className="space-y-4"
                  role="status"
                  aria-live="polite"
                  aria-label="Loading recent reports"
                >
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="space-y-2">
                      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-64 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-52 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : recentReports.length === 0 ? (
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
              ) : (
                <ul className="divide-y">
                  {recentReports.map((incident) => (
                    <li
                      key={incident.id}
                      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {INCIDENT_CATEGORY_LABELS[incident.category]}
                          </p>
                          <IncidentStatusBadge status={incident.status} />
                        </div>

                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {incident.location.label}
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {incident.reportId} ·{" "}
                          {formatShortDateTime(incident.createdAt)}
                        </p>
                      </div>

                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/my-reports/${incident.id}`}>
                          Details
                          <ArrowRight />
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  If you need help now
                </CardTitle>
                <CardDescription>
                  DISHA is a prototype and does not place calls for you.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                {emergencyNumbers.map((contact) => (
                  <a
                    key={contact.number}
                    href={`tel:${contact.number}`}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <Phone
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      {contact.label}
                    </span>
                    <span className="font-semibold">{contact.number}</span>
                  </a>
                ))}

                <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
                  Commonly used emergency numbers in India. Confirm local
                  availability before relying on them.
                </p>

                <Button asChild variant="outline" className="mt-2 w-full">
                  <Link href="/safety">
                    <ShieldCheck />
                    Safety guidance
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">How status works</CardTitle>
                <CardDescription>
                  Statuses are updated by a demo officer, not by DISHA
                  automatically.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ol className="space-y-3">
                  {statusSteps.map((step, index) => (
                    <li key={step.status} className="flex gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{step.status}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
