import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  INCIDENT_STATUS_LABELS,
  SEVERITY_LABELS,
  type IncidentStatus,
  type Severity,
} from "@/types/incident";

const statusClasses: Record<IncidentStatus, string> = {
  submitted:
    "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  under_review:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  verified:
    "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  dispatched:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  resolved:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "border-border bg-muted text-muted-foreground",
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("border", statusClasses[status])}
    >
      {INCIDENT_STATUS_LABELS[status]}
    </Badge>
  );
}

const severityClasses: Record<Severity, string> = {
  low: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  medium:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  high: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  critical:
    "border-destructive/20 bg-destructive/10 text-destructive",
};

export function SeverityBadge({ severity }: { severity?: Severity }) {
  if (!severity) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Unassigned
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("border", severityClasses[severity])}
    >
      {SEVERITY_LABELS[severity]}
    </Badge>
  );
}
