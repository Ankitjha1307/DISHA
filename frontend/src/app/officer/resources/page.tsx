"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Loader2,
  MapPin,
  RotateCw,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DemoDataNotice } from "@/components/shared/demo-data-notice";
import { EmptyState } from "@/components/shared/empty-state";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfficerResources } from "@/hooks/use-officer-resources";
import { apiFetch, ApiClientError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import {
  INCIDENT_CATEGORY_LABELS,
  RESOURCE_AVAILABILITY_LABELS,
  RESOURCE_TYPE_LABELS,
  type ResourceAvailability,
  type ResourceRecord,
} from "@/types/incident";

const availabilityClasses: Record<ResourceAvailability, string> = {
  available:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  deployed:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  unavailable: "border-border bg-muted text-muted-foreground",
};

function ResourceAvailabilityControl({
  resource,
  onUpdated,
}: {
  resource: ResourceRecord;
  onUpdated: () => void;
}) {
  const [availability, setAvailability] = useState<ResourceAvailability>(
    resource.availability
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changed = availability !== resource.availability;
  const canSave = changed && availability !== "deployed";

  const save = async () => {
    if (!canSave) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiFetch<{ resource: ResourceRecord }>(
        `/api/officer/resources/${encodeURIComponent(resource.id)}/availability`,
        {
          method: "PATCH",
          body: JSON.stringify({ availability }),
        }
      );

      toast.success("Resource availability updated");
      onUpdated();
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "The availability could not be updated."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value={availability}
          onValueChange={(value) =>
            setAvailability(value as ResourceAvailability)
          }
          disabled={saving}
        >
          <SelectTrigger
            className="h-10 w-full"
            aria-label={`Availability for ${resource.name}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
            {resource.availability === "deployed" ? (
              <SelectItem value="deployed" disabled>
                Deployed (managed by deployment)
              </SelectItem>
            ) : null}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0"
          onClick={() => void save()}
          disabled={saving || !canSave}
        >
          {saving ? <Loader2 className="motion-safe:animate-spin" /> : null}
          Save
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-xs leading-relaxed text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {resource.availability === "deployed"
            ? "Deployed resources are managed by the active demo deployment. If no active deployment exists, you can reset this seeded unit."
            : "Availability is a manual demo status. It is not live fleet data."}
        </p>
      )}
    </div>
  );
}

export default function OfficerResourcesPage() {
  const { resources, loading, error, refresh } = useOfficerResources();

  const availableCount = resources.filter(
    (resource) => resource.availability === "available"
  ).length;
  const deployedCount = resources.filter(
    (resource) => resource.availability === "deployed"
  ).length;

  return (
    <DashboardLayout role="officer">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Officer console</Badge>
              <Badge variant="secondary">Seeded inventory</Badge>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Resource inventory
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Inspect the demo ambulances, fire units, rescue teams and shelters.
              Update availability manually when a unit is not actively assigned
              by a deployment.
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
          All resources are seeded demonstration records. Their availability is
          an academic workflow value, not live fleet or emergency-service status.
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No demo resources found"
            description="Run the server seed script to create the demonstration inventory."
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">
                {resources.length} total demo resources
              </Badge>
              <Badge
                variant="outline"
                className={availabilityClasses.available}
              >
                {availableCount} available
              </Badge>
              <Badge variant="outline" className={availabilityClasses.deployed}>
                {deployedCount} deployed
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">
                          {resource.name}
                        </CardTitle>
                        <CardDescription className="mt-1 font-mono text-xs">
                          {resource.resourceCode}
                        </CardDescription>
                      </div>

                      <Badge
                        variant="outline"
                        className={availabilityClasses[resource.availability]}
                      >
                        {RESOURCE_AVAILABILITY_LABELS[resource.availability]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {RESOURCE_TYPE_LABELS[resource.type]}
                      </p>
                      <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MapPin
                          className="mt-0.5 size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        {resource.location.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {resource.location.latitude !== undefined &&
                        resource.location.longitude !== undefined
                          ? `${resource.location.latitude.toFixed(
                              5
                            )}, ${resource.location.longitude.toFixed(5)}`
                          : "Coordinates not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Supports
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {resource.capabilities.map((capability) => (
                          <Badge
                            key={capability}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {INCIDENT_CATEGORY_LABELS[capability]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto border-t pt-4">
                      <ResourceAvailabilityControl
                        resource={resource}
                        onUpdated={() => void refresh()}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Updated {formatDateTime(resource.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
