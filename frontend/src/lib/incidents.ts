import type { IncidentRecord } from "@/types/incident";

export type CitizenIncidentSummary = {
  total: number;
  awaitingReview: number;
  inProgress: number;
  resolved: number;
};

export function getCitizenIncidentSummary(
  incidents: IncidentRecord[]
): CitizenIncidentSummary {
  return {
    total: incidents.length,
    awaitingReview: incidents.filter(
      (incident) =>
        incident.status === "submitted" || incident.status === "under_review"
    ).length,
    inProgress: incidents.filter(
      (incident) =>
        incident.status === "verified" || incident.status === "dispatched"
    ).length,
    resolved: incidents.filter((incident) => incident.status === "resolved")
      .length,
  };
}

export function sortByNewest(incidents: IncidentRecord[]) {
  return [...incidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
