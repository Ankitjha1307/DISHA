"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

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
import { formatDateTime } from "@/lib/format";
import {
  RESOURCE_TYPE_LABELS,
  type ActiveDeployment,
  type DeploymentMutationResponse,
  type OfficerIncidentRecord,
} from "@/types/incident";

export function ActiveDeploymentCard({
  deployment,
  onUpdated,
}: {
  deployment: ActiveDeployment;
  onUpdated: (
    incident: OfficerIncidentRecord,
    activeDeployment: ActiveDeployment | null
  ) => void;
}) {
  const [action, setAction] = useState<"completed" | "cancelled" | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDialog = (nextAction: "completed" | "cancelled") => {
    setAction(nextAction);
    setNotes("");
    setError(null);
  };

  const submit = async () => {
    if (!action) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = notes.trim()
        ? { status: action, notes: notes.trim() }
        : { status: action };

      const result = await apiFetch<DeploymentMutationResponse>(
        `/api/officer/deployments/${encodeURIComponent(deployment.id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      onUpdated(result.incident, result.activeDeployment);
      setAction(null);
      toast.success(
        action === "completed"
          ? "Deployment completed"
          : "Deployment cancelled"
      );
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "The deployment could not be updated."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="size-4 text-primary" />
            Active demo deployment
          </CardTitle>
          <CardDescription>
            This assignment keeps the resource marked deployed until the officer
            completes or cancels it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {deployment.resource ? (
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{deployment.resource.name}</p>
                <span className="rounded-md bg-background px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {deployment.resource.resourceCode}
                </span>
                <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                  Deployed
                </span>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {deployment.resource.location.label}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {RESOURCE_TYPE_LABELS[deployment.resource.type]} · Assigned{" "}
                {formatDateTime(deployment.createdAt)}
              </p>
            </div>
          ) : (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              The assigned resource record is unavailable.
            </p>
          )}

          {deployment.notes ? (
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Deployment notes
              </p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                {deployment.notes}
              </p>
            </div>
          ) : null}

          <div className="grid gap-2 border-t pt-5">
            <Button type="button" onClick={() => openDialog("completed")}>
              <CheckCircle2 />
              Mark deployment complete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => openDialog("cancelled")}
            >
              <XCircle />
              Cancel deployment
            </Button>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Completing sets the report to resolved and frees the resource.
            Cancelling returns the report to verified and also frees the
            resource. No live tracking is available.
          </p>
        </CardContent>
      </Card>

      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setAction(null);
            setError(null);
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
                ? "The report will be marked resolved and the demo resource will become available again."
                : "The report will return to verified status and the demo resource will become available again. You can then choose another resource."}
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="deployment-update-notes">
              Update notes (optional)
            </Label>
            <Textarea
              id="deployment-update-notes"
              className="min-h-20 resize-y"
              maxLength={500}
              placeholder="Optional internal note for this deployment update."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAction(null)}
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
    </>
  );
}
