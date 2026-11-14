import { Types } from "mongoose";

import type { IncidentStatus, Severity } from "../models/common";
import { Incident } from "../models/Incident";
import { ApiError } from "../utils/ApiError";
import type { OfficerIncidentQuery } from "../validators/officerIncident";

type TransitionAction = "review" | "verify" | "reject";

const transitions: Record<
  TransitionAction,
  { from: IncidentStatus[]; to: IncidentStatus; message: string }
> = {
  review: {
    from: ["submitted"],
    to: "under_review",
    message: "Only a newly submitted report can be moved into review",
  },
  verify: {
    from: ["under_review"],
    to: "verified",
    message: "A report must be under review before it can be verified",
  },
  reject: {
    from: ["submitted", "under_review"],
    to: "rejected",
    message: "Only a report that is awaiting review can be rejected",
  },
};

function assertValidIncidentId(incidentId: string) {
  if (!Types.ObjectId.isValid(incidentId)) {
    throw new ApiError(404, "Report not found");
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listOfficerIncidents(filters: OfficerIncidentQuery) {
  const conditions: Record<string, unknown> = {};

  if (filters.status) {
    conditions.status = filters.status;
  }

  if (filters.category) {
    conditions.category = filters.category;
  }

  if (filters.severity) {
    conditions.severity = filters.severity;
  }

  if (filters.q) {
    const search = new RegExp(escapeRegExp(filters.q), "i");
    conditions.$or = [
      { reportId: search },
      { "location.label": search },
    ];
  }

  return Incident.find(conditions).sort({ createdAt: -1 }).limit(200);
}

export async function getOfficerIncident(incidentId: string) {
  assertValidIncidentId(incidentId);

  const incident = await Incident.findById(incidentId).select("+officerNotes");

  if (!incident) {
    throw new ApiError(404, "Report not found");
  }

  return incident;
}

export async function transitionIncident(
  incidentId: string,
  action: TransitionAction,
  notes?: string
) {
  assertValidIncidentId(incidentId);

  const transition = transitions[action];
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw new ApiError(404, "Report not found");
  }

  if (!transition.from.includes(incident.status)) {
    throw new ApiError(409, transition.message);
  }

  const updated = await Incident.findOneAndUpdate(
    { _id: incidentId, status: { $in: transition.from } },
    {
      $set: {
        status: transition.to,
        ...(notes ? { officerNotes: notes } : {}),
      },
    },
    { returnDocument: "after", runValidators: true }
  ).select("+officerNotes");

  if (!updated) {
    throw new ApiError(
      409,
      "The report changed while this request was being processed. Reload and try again."
    );
  }

  return updated;
}

export async function setIncidentSeverity(
  incidentId: string,
  severity: Severity
) {
  assertValidIncidentId(incidentId);

  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw new ApiError(404, "Report not found");
  }

  if (incident.status === "rejected") {
    throw new ApiError(409, "A rejected report cannot be assigned a severity");
  }

  const updated = await Incident.findByIdAndUpdate(
    incidentId,
    { $set: { severity } },
    { returnDocument: "after", runValidators: true }
  ).select("+officerNotes");

  if (!updated) {
    throw new ApiError(404, "Report not found");
  }

  return updated;
}
