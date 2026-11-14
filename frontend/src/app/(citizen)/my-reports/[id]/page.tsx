"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Camera,
  ClipboardList,
  Loader2,
  MapPin,
  RotateCw,
  ShieldCheck,
} from "lucide-react";

import { StatusTimeline } from "@/components/citizen/status-timeline";
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
import { apiAssetUrl, apiFetch, ApiClientError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import {
  INCIDENT_CATEGORY_LABELS,
  type IncidentRecord,
} from "@/types/incident";

export default function MyReportDetailPage() {
  const params = useParams();
  const incidentId = typeof params.id === "string" ? params.id : "";

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    void apiFetch<{ incident: IncidentRecord }>(
      `/api/incidents/my/${encodeURIComponent(incidentId)}`,
      { signal: controller.signal }
    )
      .then((data) => {
        if (cancelled) {
          return;
        }

        setIncident(data.incident);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setIncident(null);
        setError(
          requestError instanceof ApiClientError
            ? requestError.status === 404
              ? "Report not found, or it does not belong to this account."
              : requestError.message
            : "Unable to load this report."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [incidentId, reloadKey]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((value) => value + 1);
  };

  const imageUrl = apiAssetUrl(incident?.imageUrl);

  return (
    <DashboardLayout role="citizen">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/my-reports">
              <ArrowLeft />
              Back to my reports
            </Link>
          </Button>
        </div>

        {loading ? (
          <div
            className="space-y-4"
            role="status"
            aria-live="polite"
            aria-label="Loading report"
          >
            <div className="h-8 w-56 animate-pulse rounded bg-muted" />
            <div className="h-4 w-80 animate-pulse rounded bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : error || !incident ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={AlertTriangle}
                title="Report unavailable"
                description={error ?? "This report could not be loaded."}
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={retry}>
                      <RotateCw />
                      Try again
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/my-reports">Back to my reports</Link>
                    </Button>
                  </div>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-sm font-medium text-muted-foreground">
                    {incident.reportId}
                  </p>
                  <IncidentStatusBadge status={incident.status} />
                  <SeverityBadge severity={incident.severity} />
                </div>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {INCIDENT_CATEGORY_LABELS[incident.category]}
                </h1>

                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-primary" aria-hidden="true" />
                  {incident.location.label}
                </p>
              </div>

              <Button asChild variant="outline" className="shrink-0">
                <Link href="/report-incident">Report another incident</Link>
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Citizen description</CardTitle>
                    <CardDescription>
                      Information submitted with this report.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <p className="text-sm leading-7 whitespace-pre-wrap">
                      {incident.description}
                    </p>

                    <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Location
                        </p>
                        <p className="mt-1 flex items-start gap-1.5 text-sm">
                          <MapPin
                            className="mt-0.5 size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          {incident.location.label}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Coordinates
                        </p>
                        <p className="mt-1 text-sm">
                          {incident.location.latitude !== undefined &&
                          incident.location.longitude !== undefined
                            ? `${incident.location.latitude.toFixed(
                                5
                              )}, ${incident.location.longitude.toFixed(5)}`
                            : "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Submitted
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm">
                          <CalendarClock
                            className="size-4 text-primary"
                            aria-hidden="true"
                          />
                          {formatDateTime(incident.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Last updated
                        </p>
                        <p className="mt-1 text-sm">
                          {formatDateTime(incident.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="size-4 text-primary" />
                      Evidence
                    </CardTitle>
                    <CardDescription>
                      Optional image submitted by the citizen.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {imageUrl ? (
                      /* Evidence image is served by the API on its own origin. */
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageUrl}
                        alt="Evidence submitted with this report"
                        className="max-h-[28rem] w-full rounded-xl border object-contain"
                      />
                    ) : (
                      <EmptyState
                        icon={Camera}
                        title="No image attached"
                        description="This report was submitted without a photo."
                        className="py-8"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Report status</CardTitle>
                    <CardDescription>
                      Updated manually by a demo officer.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <StatusTimeline status={incident.status} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ShieldCheck className="size-4 text-primary" />
                      Good to know
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                    <p>
                      DISHA is an academic prototype. It does not notify
                      emergency services or guarantee a response.
                    </p>
                    <p>
                      Internal officer notes are not shown to citizens. Only the
                      public status and the details you submitted appear here.
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/safety">
                        <ClipboardList />
                        Safety guidance
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {loading ? (
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 motion-safe:animate-spin" />
            Loading report…
          </p>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
