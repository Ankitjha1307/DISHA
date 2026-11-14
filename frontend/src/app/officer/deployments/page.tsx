"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  RotateCw,
  Truck,
  Waypoints,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DemoDataNotice } from "@/components/shared/demo-data-notice";
import { EmptyState } from "@/components/shared/empty-state";
import { IncidentStatusBadge } from "@/components/shared/incident-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useOfficerDeployments } from "@/hooks/use-officer-deployments";
import { apiFetch, ApiClientError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import {
  DEPLOYMENT_STATUS_LABELS,
  INCIDENT_CATEGORY_LABELS,
  RESOURCE_TYPE_LABELS,
  type DeploymentMutationResponse,
  type DeploymentStatus,
  type OfficerDeploymentRecord,
} from "@/types/incident";

const deploymentStatusClasses: Record<DeploymentStatus, string> = {
  assigned:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  completed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  cancelled: "border-border bg-muted text-muted-foreground",
};

function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  return (
    <Badge
      variant="outline"
      className={deploymentStatusClasses[status]}
    >
      {DEPLOYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export default function OfficerDeploymentsPage() {
  const { deployments, loading, error, refresh } = useOfficerDeployments();
  const [selected, setSelected] =
    useState<OfficerDeploymentRecord | null>(null);
  const [action, setAction] = useState<"completed" | "cancelled" | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeDeployments = deployments.filter(
    (deployment) => deployment.status === "assigned"
  );
  const pastDeployments = deployments.filter(
    (deployment) => deployment.status !== "assigned"
  );

  const openDialog = (
    deployment: OfficerDeploymentRecord,
    nextAction: "completed" | "cancelled"
  ) => {
    setSelected(deployment);
    setAction(nextAction);
    setNotes("");
    setActionError(null);
  };

  const closeDialog = () => {
    if (!submitting) {
      setSelected(null);
      setAction(null);
      setActionError(null);
    }
  };

  const submit = async () => {
    if (!selected || !action) {
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      const payload = notes.trim()
        ? { status: action, notes: notes.trim() }
        : { status: action };

      await apiFetch<DeploymentMutationResponse>(
        `/api/officer/deployments/${encodeURIComponent(selected.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      toast.success(
        action === "completed"
          ? "Deployment completed"
          : "Deployment cancelled"
      );
      setSelected(null);
      setAction(null);
      await refresh();
    } catch (requestError) {
      setActionError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "The deployment could not be updated."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="officer">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Officer console</Badge>
              <Badge variant="secondary">Demo assignments</Badge>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Deployments
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Review officer-confirmed demo resource assignments. Completing or
              cancelling a deployment updates the linked report and frees the
              resource.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void refresh()}
            disabled={loading}
            className="shrink-0"
          >
            <RotateCw />
            Refresh
          </Button>
        </div>

        <DemoDataNotice>
          Deployments are academic workflow records. No real vehicle is
          dispatched, contacted or tracked, and no authority is notified.
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

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : deployments.length === 0 ? (
          <EmptyState
            icon={Waypoints}
            title="No demo deployments yet"
            description="Verify an incident, request resource recommendations and confirm an eligible resource to create a deployment."
            action={
              <Button asChild variant="outline">
                <Link href="/officer/incidents">Open incident queue</Link>
              </Button>
            }
          />
        ) : (
          <>
            <section aria-labelledby="active-deployments-heading">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="active-deployments-heading"
                    className="text-lg font-semibold tracking-tight"
                  >
                    Active deployments
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Resources currently reserved by an officer-confirmed demo
                    assignment.
                  </p>
                </div>
                <Badge variant="outline">
                  {activeDeployments.length} active
                </Badge>
              </div>

              {activeDeployments.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <EmptyState
                      icon={Waypoints}
                      title="No active deployments"
                      description="Completed and cancelled assignments are listed below."
                      className="py-6"
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {activeDeployments.map((deployment) => (
                    <Card key={deployment.id} className="border-primary/20">
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            {deployment.incident ? (
                              <Link
                                href={`/officer/incidents/${deployment.incident.id}`}
                                className="font-mono text-sm font-medium underline-offset-4 hover:underline"
                              >
                                {deployment.incident.reportId}
                              </Link>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Report unavailable
                              </p>
                            )}

                            <CardDescription className="mt-1">
                              {deployment.incident
                                ? INCIDENT_CATEGORY_LABELS[
                                    deployment.incident.category
                                  ]
                                : "Demo incident"}
                            </CardDescription>
                          </div>

                          <DeploymentStatusBadge status={deployment.status} />
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="rounded-xl border bg-muted/30 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">
                              {deployment.resource?.name ??
                                "Resource unavailable"}
                            </p>
                            {deployment.resource ? (
                              <span className="rounded-md bg-background px-2 py-0.5 font-mono text-xs text-muted-foreground">
                                {deployment.resource.resourceCode}
                              </span>
                            ) : null}
                          </div>

                          {deployment.resource ? (
                            <>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin
                                  className="size-3.5 shrink-0"
                                  aria-hidden="true"
                                />
                                {deployment.resource.location.label}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {RESOURCE_TYPE_LABELS[deployment.resource.type]}{" "}
                                · Assigned{" "}
                                {formatDateTime(deployment.createdAt)}
                              </p>
                            </>
                          ) : null}
                        </div>

                        {deployment.incident ? (
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-muted-foreground">
                              Report status
                            </span>
                            <IncidentStatusBadge
                              status={deployment.incident.status}
                            />
                          </div>
                        ) : null}

                        {deployment.notes ? (
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {deployment.notes}
                          </p>
                        ) : null}

                        <div className="flex flex-wrap gap-2 border-t pt-4">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => openDialog(deployment, "completed")}
                          >
                            <CheckCircle2 />
                            Complete
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(deployment, "cancelled")}
                          >
                            <XCircle />
                            Cancel
                          </Button>
                          {deployment.incident ? (
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="ml-auto"
                            >
                              <Link
                                href={`/officer/incidents/${deployment.incident.id}`}
                              >
                                Open report
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="deployment-history-heading">
              <div className="mb-3">
                <h2
                  id="deployment-history-heading"
                  className="text-lg font-semibold tracking-tight"
                >
                  Deployment history
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Completed and cancelled demo assignments, newest first.
                </p>
              </div>

              {pastDeployments.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <EmptyState
                      icon={Waypoints}
                      title="No deployment history"
                      description="Completed or cancelled assignments will appear here."
                      className="py-6"
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="divide-y p-0">
                    {pastDeployments.map((deployment) => (
                      <div
                        key={deployment.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {deployment.incident ? (
                              <Link
                                href={`/officer/incidents/${deployment.incident.id}`}
                                className="font-mono text-xs font-medium underline-offset-4 hover:underline"
                              >
                                {deployment.incident.reportId}
                              </Link>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Report unavailable
                              </span>
                            )}
                            <DeploymentStatusBadge status={deployment.status} />
                          </div>

                          <p className="mt-1 text-sm">
                            {deployment.resource?.name ??
                              "Resource unavailable"}
                            {deployment.resource
                              ? ` (${deployment.resource.resourceCode})`
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Updated {formatDateTime(deployment.updatedAt)}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                          <Truck className="size-3.5" aria-hidden="true" />
                          {deployment.incident
                            ? INCIDENT_CATEGORY_LABELS[
                                deployment.incident.category
                              ]
                            : "Demo incident"}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </div>

      <Dialog
        open={selected !== null && action !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "completed"
                ? "Complete this deployment?"
                : "Cancel this deployment?"}
            </DialogTitle>
            <DialogDescription>
              {action === "completed"
                ? "The linked report will be marked resolved and the demo resource will become available again."
                : "The linked report will return to verified status and the demo resource will become available again."}
            </DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="rounded-lg bg-muted px-3 py-2 text-sm">
              <p className="font-medium">
                {selected.incident?.reportId ?? "Demo report"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected.resource?.name ?? "Resource unavailable"}
                {selected.resource
                  ? ` · ${selected.resource.resourceCode}`
                  : ""}
              </p>
            </div>
          ) : null}

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

          <div className="space-y-2">
            <Label htmlFor="deployment-dialog-notes">
              Update notes (optional)
            </Label>
            <Textarea
              id="deployment-dialog-notes"
              className="min-h-20 resize-y"
              maxLength={500}
              placeholder="Optional note for this deployment update."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={submitting}
            >
              Keep active
            </Button>
            <Button
              type="button"
              variant={action === "cancelled" ? "destructive" : "default"}
              onClick={() => void submit()}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="motion-safe:animate-spin" />
              ) : action === "cancelled" ? (
                <XCircle />
              ) : (
                <CheckCircle2 />
              )}
              {action === "completed"
                ? "Complete deployment"
                : "Cancel deployment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
