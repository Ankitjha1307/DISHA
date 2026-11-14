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
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ActiveDeploymentCard } from "@/components/officer/active-deployment-card";
import { ResourceRecommendations } from "@/components/officer/resource-recommendations";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiAssetUrl, apiFetch, ApiClientError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_STATUS_LABELS,
  SEVERITIES,
  SEVERITY_LABELS,
  type ActiveDeployment,
  type OfficerIncidentDetailResponse,
  type OfficerIncidentRecord,
  type Severity,
} from "@/types/incident";

type TransitionAction = "review" | "verify" | "reject";
type SubmittingAction = TransitionAction | "severity";

export default function OfficerIncidentDetailPage() {
  const params = useParams();
  const incidentId = typeof params.id === "string" ? params.id : "";

  const [incident, setIncident] = useState<OfficerIncidentRecord | null>(null);
  const [activeDeployment, setActiveDeployment] =
    useState<ActiveDeployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] =
    useState<SubmittingAction | null>(null);
  const [dialogAction, setDialogAction] = useState<
    "verify" | "reject" | null
  >(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    void apiFetch<OfficerIncidentDetailResponse>(
      `/api/officer/incidents/${encodeURIComponent(incidentId)}`,
      { signal: controller.signal }
    )
      .then((data) => {
        if (cancelled) {
          return;
        }

        setIncident(data.incident);
        setActiveDeployment(data.activeDeployment);
        setNotes(data.incident.officerNotes ?? "");
        setSeverity(data.incident.severity ?? "");
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
              ? "Report not found."
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

  const applyIncident = (updated: OfficerIncidentRecord) => {
    setIncident(updated);
    setNotes(updated.officerNotes ?? "");
    setSeverity(updated.severity ?? "");
  };

  const handleDeploymentUpdated = (
    updated: OfficerIncidentRecord,
    updatedDeployment: ActiveDeployment | null
  ) => {
    applyIncident(updated);
    setActiveDeployment(updatedDeployment);
  };

  const runTransition = async (action: TransitionAction) => {
    setActionError(null);
    setSubmittingAction(action);

    try {
      const payload = notes.trim() ? { notes: notes.trim() } : {};
      const data = await apiFetch<{ incident: OfficerIncidentRecord }>(
        `/api/officer/incidents/${encodeURIComponent(incidentId)}/${action}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      applyIncident(data.incident);
      setDialogAction(null);

      toast.success(
        action === "review"
          ? "Review started"
          : action === "verify"
            ? "Report verified"
            : "Report rejected"
      );
    } catch (requestError) {
      const message =
        requestError instanceof ApiClientError
          ? requestError.message
          : "The officer action could not be completed.";

      setActionError(message);
      setDialogAction(null);
      toast.error(message);
    } finally {
      setSubmittingAction(null);
    }
  };

  const saveSeverity = async () => {
    if (!severity) {
      setActionError("Choose a severity before saving.");
      return;
    }

    setActionError(null);
    setSubmittingAction("severity");

    try {
      const data = await apiFetch<{ incident: OfficerIncidentRecord }>(
        `/api/officer/incidents/${encodeURIComponent(incidentId)}/severity`,
        {
          method: "PATCH",
          body: JSON.stringify({ severity }),
        }
      );

      applyIncident(data.incident);
      toast.success("Severity updated");
    } catch (requestError) {
      const message =
        requestError instanceof ApiClientError
          ? requestError.message
          : "The severity could not be updated.";

      setActionError(message);
      toast.error(message);
    } finally {
      setSubmittingAction(null);
    }
  };

  const canBeginReview = incident?.status === "submitted";
  const canVerify = incident?.status === "under_review";
  const canReject =
    incident?.status === "submitted" || incident?.status === "under_review";
  const canSetSeverity = incident?.status !== "rejected";
  const severityChanged =
    Boolean(severity) && severity !== incident?.severity && canSetSeverity;
  const imageUrl = apiAssetUrl(incident?.imageUrl);

  return (
    <DashboardLayout role="officer">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/officer/incidents">
              <ArrowLeft />
              Back to incident queue
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
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="h-4 w-96 animate-pulse rounded bg-muted" />
            <div className="h-72 animate-pulse rounded-xl bg-muted" />
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
                      <Link href="/officer/incidents">
                        Back to incident queue
                      </Link>
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

              <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Current status
                </p>
                <p className="mt-1 font-medium">
                  {INCIDENT_STATUS_LABELS[incident.status]}
                </p>
              </div>
            </div>

            {actionError ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{actionError}</span>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary" />
                      Citizen-provided report
                    </CardTitle>
                    <CardDescription>
                      These details were submitted by the citizen. Severity is
                      assigned separately by an officer.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Description
                      </p>
                      <p className="mt-2 text-sm leading-7 whitespace-pre-wrap">
                        {incident.description}
                      </p>
                    </div>

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
                      Optional image submitted with the report.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {imageUrl ? (
                      /* Evidence image is served by the API on its own origin. */
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageUrl}
                        alt="Evidence submitted with this report"
                        className="max-h-[30rem] w-full rounded-xl border object-contain"
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

                {activeDeployment ? (
                  <ActiveDeploymentCard
                    deployment={activeDeployment}
                    onUpdated={handleDeploymentUpdated}
                  />
                ) : null}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ShieldAlert className="size-4 text-primary" />
                      Officer decision
                    </CardTitle>
                    <CardDescription>
                      Decisions are recorded by the API and cannot be made by
                      citizens.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="officer-severity">
                        Operational severity
                      </Label>

                      {canSetSeverity ? (
                        <div className="flex gap-2">
                          <Select
                            value={severity}
                            onValueChange={(value) =>
                              setSeverity(value as Severity)
                            }
                          >
                            <SelectTrigger
                              id="officer-severity"
                              className="h-10 w-full"
                            >
                              <SelectValue placeholder="Set severity" />
                            </SelectTrigger>
                            <SelectContent>
                              {SEVERITIES.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {SEVERITY_LABELS[value]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 shrink-0"
                            onClick={() => void saveSeverity()}
                            disabled={
                              submittingAction !== null || !severityChanged
                            }
                          >
                            {submittingAction === "severity" ? (
                              <Loader2 className="motion-safe:animate-spin" />
                            ) : null}
                            Save
                          </Button>
                        </div>
                      ) : (
                        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                          Severity cannot be changed after a report is rejected.
                        </p>
                      )}

                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Severity is officer-assigned. Citizen reports do not set
                        it.
                      </p>
                    </div>

                    <div className="space-y-2 border-t pt-5">
                      <Label htmlFor="officer-notes">
                        Officer notes{" "}
                        <span className="font-normal text-muted-foreground">
                          (internal)
                        </span>
                      </Label>

                      {canBeginReview || canVerify || canReject ? (
                        <Textarea
                          id="officer-notes"
                          placeholder="Optional internal note for this decision. Citizens never see this field."
                          className="min-h-28 resize-y"
                          maxLength={2000}
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                        />
                      ) : (
                        <p className="rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap">
                          {incident.officerNotes ||
                            "No internal officer note was recorded."}
                        </p>
                      )}

                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Internal notes are never included in citizen responses.
                      </p>
                    </div>

                    {canBeginReview ? (
                      <div className="grid gap-2 border-t pt-5">
                        <Button
                          type="button"
                          onClick={() => void runTransition("review")}
                          disabled={submittingAction !== null}
                        >
                          {submittingAction === "review" ? (
                            <Loader2 className="motion-safe:animate-spin" />
                          ) : (
                            <ClipboardList />
                          )}
                          Begin review
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => setDialogAction("reject")}
                          disabled={submittingAction !== null}
                        >
                          <XCircle />
                          Reject report
                        </Button>
                      </div>
                    ) : null}

                    {canVerify ? (
                      <div className="grid gap-2 border-t pt-5">
                        <Button
                          type="button"
                          onClick={() => setDialogAction("verify")}
                          disabled={submittingAction !== null}
                        >
                          <ShieldCheck />
                          Verify report
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => setDialogAction("reject")}
                          disabled={submittingAction !== null}
                        >
                          <XCircle />
                          Reject report
                        </Button>
                      </div>
                    ) : null}

                    {!canBeginReview && !canVerify ? (
                      <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                        No verification decision is pending. This report is
                        currently{" "}
                        <span className="font-medium text-foreground">
                          {INCIDENT_STATUS_LABELS[incident.status]}
                        </span>
                        .
                      </p>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Audit details</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Report ID</span>
                      <span className="font-mono text-xs">
                        {incident.reportId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Last update</span>
                      <span className="text-right text-xs">
                        {formatDateTime(incident.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Severity</span>
                      <SeverityBadge severity={incident.severity} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {incident.status === "verified" ? (
              <ResourceRecommendations
                incidentId={incident.id}
                onDeployed={handleDeploymentUpdated}
              />
            ) : null}

            {incident.status === "dispatched" && !activeDeployment ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  This report is marked dispatched, but no active deployment
                  record was found. Review the deployments list before making
                  further changes.
                </span>
              </div>
            ) : null}
          </>
        )}

        <Dialog
          open={dialogAction !== null}
          onOpenChange={(open) => {
            if (!open && submittingAction === null) {
              setDialogAction(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogAction === "verify"
                  ? "Verify this report?"
                  : "Reject this report?"}
              </DialogTitle>
              <DialogDescription>
                {dialogAction === "verify"
                  ? "Verification accepts the report for a demo response and makes it available for resource recommendations. The citizen will see the updated status."
                  : "Rejection closes this report for the demo workflow. The citizen will see the rejected status, but internal officer notes remain private."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAction(null)}
                disabled={submittingAction !== null}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant={dialogAction === "reject" ? "destructive" : "default"}
                onClick={() => {
                  if (dialogAction) {
                    void runTransition(dialogAction);
                  }
                }}
                disabled={submittingAction !== null}
              >
                {submittingAction === "verify" ||
                submittingAction === "reject" ? (
                  <Loader2 className="motion-safe:animate-spin" />
                ) : null}
                {dialogAction === "verify" ? "Verify report" : "Reject report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
