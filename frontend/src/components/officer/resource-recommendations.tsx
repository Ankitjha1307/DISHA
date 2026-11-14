"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  MapPin,
  RotateCw,
  Ruler,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
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
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, ApiClientError } from "@/lib/api";
import {
  INCIDENT_CATEGORY_LABELS,
  RESOURCE_TYPE_LABELS,
  type ActiveDeployment,
  type DeploymentMutationResponse,
  type OfficerIncidentRecord,
  type RecommendationsResponse,
  type ResourceRecommendation,
} from "@/types/incident";

export function ResourceRecommendations({
  incidentId,
  onDeployed,
}: {
  incidentId: string;
  onDeployed: (
    incident: OfficerIncidentRecord,
    activeDeployment: ActiveDeployment | null
  ) => void;
}) {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [deployTarget, setDeployTarget] =
    useState<ResourceRecommendation | null>(null);
  const [notes, setNotes] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    void apiFetch<RecommendationsResponse>(
      `/api/officer/incidents/${encodeURIComponent(incidentId)}/recommendations`,
      { signal: controller.signal }
    )
      .then((result) => {
        if (cancelled) {
          return;
        }

        setData(result);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setData(null);
        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Unable to load resource recommendations."
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

  const openDeployDialog = (recommendation: ResourceRecommendation) => {
    setDeployTarget(recommendation);
    setNotes("");
    setDeployError(null);
  };

  const confirmDeployment = async () => {
    if (!deployTarget) {
      return;
    }

    setDeploying(true);
    setDeployError(null);

    try {
      const payload = notes.trim()
        ? { resourceId: deployTarget.id, notes: notes.trim() }
        : { resourceId: deployTarget.id };

      const result = await apiFetch<DeploymentMutationResponse>(
        `/api/officer/incidents/${encodeURIComponent(incidentId)}/deployments`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      onDeployed(result.incident, result.activeDeployment);
      setDeployTarget(null);
      toast.success("Demo deployment confirmed");
    } catch (requestError) {
      setDeployError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "The deployment could not be created."
      );
    } finally {
      setDeploying(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-4 text-primary" />
              Resource recommendations
            </CardTitle>
            <CardDescription>
              Eligible available demo resources ranked by capability and
              straight-line distance. An officer must confirm every deployment.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={retry}
            disabled={loading}
          >
            <RotateCw />
            Refresh
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            Distances are straight-line estimates, not road distances, travel
            times or live availability. No resource is dispatched automatically.
          </p>

          {loading ? (
            <div
              className="space-y-3"
              role="status"
              aria-live="polite"
              aria-label="Loading recommendations"
            >
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="space-y-2 rounded-xl border p-4"
                >
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-72 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-56 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {error}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={retry}>
                <RotateCw />
                Try again
              </Button>
            </div>
          ) : data && data.recommendations.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No eligible available resources"
              description={
                data.message ??
                "No available demo resource supports this incident category."
              }
              className="py-8"
            />
          ) : data ? (
            <>
              {data.message ? (
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  {data.message}
                </p>
              ) : null}

              <ul className="space-y-3">
                {data.recommendations.map((recommendation) => (
                  <li
                    key={recommendation.id}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{recommendation.name}</p>
                          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                            {recommendation.resourceCode}
                          </span>
                          {recommendation.distanceKm !== undefined ? (
                            <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              <Ruler className="size-3" aria-hidden="true" />
                              {recommendation.distanceKm.toFixed(2)} km
                            </span>
                          ) : null}
                        </div>

                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {recommendation.location.label}
                        </p>

                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {RESOURCE_TYPE_LABELS[recommendation.type]} ·{" "}
                          {recommendation.capabilities
                            .map(
                              (capability) =>
                                INCIDENT_CATEGORY_LABELS[capability]
                            )
                            .join(", ")}
                        </p>

                        <p className="text-sm leading-relaxed">
                          {recommendation.explanation}
                        </p>
                      </div>

                      <Button
                        type="button"
                        className="shrink-0"
                        onClick={() => openDeployDialog(recommendation)}
                      >
                        <Truck />
                        Deploy this resource
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={deployTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deploying) {
            setDeployTarget(null);
            setDeployError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm demo deployment</DialogTitle>
            <DialogDescription>
              This records an officer-confirmed assignment in the demo system.
              DISHA does not contact or dispatch a real resource.
            </DialogDescription>
          </DialogHeader>

          {deployTarget ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                <p className="font-medium">{deployTarget.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {deployTarget.resourceCode} ·{" "}
                  {deployTarget.location.label}
                  {deployTarget.distanceKm !== undefined
                    ? ` · ${deployTarget.distanceKm.toFixed(2)} km straight-line`
                    : ""}
                </p>
              </div>

              {deployError ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{deployError}</span>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="deployment-notes">
                  Deployment notes (optional)
                </Label>
                <Textarea
                  id="deployment-notes"
                  className="min-h-20 resize-y"
                  maxLength={500}
                  placeholder="For example: Demo unit assigned for local coordination."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeployTarget(null)}
              disabled={deploying}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void confirmDeployment()}
              disabled={deploying}
            >
              {deploying ? (
                <Loader2 className="motion-safe:animate-spin" />
              ) : (
                <Truck />
              )}
              Confirm deployment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
