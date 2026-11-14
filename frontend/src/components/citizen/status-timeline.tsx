import {
  CheckCircle2,
  Circle,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  INCIDENT_STATUS_LABELS,
  type IncidentStatus,
} from "@/types/incident";

const steps: { status: IncidentStatus; description: string }[] = [
  {
    status: "submitted",
    description: "Your report was recorded by DISHA.",
  },
  {
    status: "under_review",
    description: "An officer started reviewing the details.",
  },
  {
    status: "verified",
    description: "An officer accepted the report for a demo response.",
  },
  {
    status: "dispatched",
    description: "A demo resource was assigned by an officer.",
  },
  {
    status: "resolved",
    description: "The incident was marked addressed.",
  },
];

const statusOrder: Partial<Record<IncidentStatus, number>> = {
  submitted: 0,
  under_review: 1,
  verified: 2,
  dispatched: 3,
  resolved: 4,
};

export function StatusTimeline({ status }: { status: IncidentStatus }) {
  if (status === "rejected") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">
            {INCIDENT_STATUS_LABELS.rejected}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            An officer reviewed this report and did not accept it for a demo
            response. Submit a new report if the situation changes.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = statusOrder[status] ?? 0;

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isComplete ? (
                <CheckCircle2
                  className={cn(
                    "size-5 shrink-0",
                    isCurrent ? "text-primary" : "text-emerald-600"
                  )}
                />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground/40" />
              )}

              {index < steps.length - 1 ? (
                <span
                  className={cn(
                    "mt-1 h-full min-h-4 w-px",
                    index < currentIndex ? "bg-emerald-500/40" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </div>

            <div className="pb-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {INCIDENT_STATUS_LABELS[step.status]}
                {isCurrent ? (
                  <span className="ml-2 text-[10px] font-semibold tracking-wide text-primary uppercase">
                    Current
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
