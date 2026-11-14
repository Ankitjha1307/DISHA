import { Types } from "mongoose";

import {
  Incident,
  type IncidentDocument,
} from "../models/Incident";
import { ApiError } from "../utils/ApiError";
import { generateReportId } from "../utils/reportId";
import type {
  CreateIncidentInput,
  ListIncidentsQuery,
} from "../validators/incident";

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function createIncident(
  reporterId: string,
  input: CreateIncidentInput,
  imageUrl?: string
): Promise<IncidentDocument> {
  const location = {
    label: input.locationLabel,
    ...(input.latitude === undefined || input.longitude === undefined
      ? {}
      : { latitude: input.latitude, longitude: input.longitude }),
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const reportId = await generateReportId();

    try {
      return await Incident.create({
        reportId,
        reporterId,
        category: input.category,
        description: input.description,
        location,
        imageUrl,
        status: "submitted",
      });
    } catch (error) {
      if (isDuplicateKeyError(error) && attempt < 2) {
        continue;
      }

      throw error;
    }
  }

  throw new ApiError(500, "Could not create the incident report");
}

export async function listCitizenIncidents(
  reporterId: string,
  filters: ListIncidentsQuery
) {
  return Incident.find({
    reporterId,
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  }).sort({ createdAt: -1 });
}

export async function getCitizenIncident(
  reporterId: string,
  incidentId: string
) {
  if (!Types.ObjectId.isValid(incidentId)) {
    return null;
  }

  return Incident.findOne({
    _id: incidentId,
    reporterId,
  });
}
