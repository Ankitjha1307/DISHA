import { Types } from "mongoose";

import type { IncidentCategory, ResourceType } from "../models/common";
import { Incident } from "../models/Incident";
import { Resource } from "../models/Resource";
import { ApiError } from "../utils/ApiError";
import { haversineDistanceKm } from "../utils/haversine";
import {
  resourceToJson,
  type ResourceJson,
} from "./resourceService";

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  ambulance: "Ambulance",
  fire_unit: "Fire unit",
  rescue_team: "Rescue team",
  shelter: "Shelter",
};

const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  fire: "fire",
  road_accident: "road accident",
  flooding: "flooding",
  building_damage: "building damage",
  medical_emergency: "medical emergency",
  other: "other",
};

export type ResourceRecommendation = ResourceJson & {
  distanceKm?: number;
  explanation: string;
};

/**
 * Rank available resources by capability match and straight-line distance.
 *
 * All returned resources support the incident category. When incident
 * coordinates exist, they are sorted by Haversine distance. This is explicitly
 * not a road distance, travel time or dispatch recommendation.
 */
export async function getResourceRecommendations(incidentId: string) {
  if (!Types.ObjectId.isValid(incidentId)) {
    throw new ApiError(404, "Report not found");
  }

  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw new ApiError(404, "Report not found");
  }

  if (incident.status !== "verified") {
    throw new ApiError(
      409,
      "Resource recommendations are available only for verified reports"
    );
  }

  const resources = await Resource.find({
    availability: "available",
    capabilities: incident.category,
  }).sort({ resourceCode: 1 });

  const hasIncidentCoordinates =
    typeof incident.location.latitude === "number" &&
    typeof incident.location.longitude === "number";

  const recommendations: ResourceRecommendation[] = resources.map(
    (resource) => {
      const resourceJson = resourceToJson(resource);
      const hasResourceCoordinates =
        typeof resource.location.latitude === "number" &&
        typeof resource.location.longitude === "number";

      if (hasIncidentCoordinates && hasResourceCoordinates) {
        const distanceKm = Number(
          haversineDistanceKm(
            {
              latitude: incident.location.latitude as number,
              longitude: incident.location.longitude as number,
            },
            {
              latitude: resource.location.latitude as number,
              longitude: resource.location.longitude as number,
            }
          ).toFixed(2)
        );

        return {
          ...resourceJson,
          distanceKm,
          explanation: `${RESOURCE_TYPE_LABELS[resourceJson.type]} based at ${resourceJson.location.label}; supports ${CATEGORY_LABELS[incident.category]} response; ${distanceKm.toFixed(2)} km straight-line from the incident.`,
        };
      }

      return {
        ...resourceJson,
        explanation: `${RESOURCE_TYPE_LABELS[resourceJson.type]} based at ${resourceJson.location.label}; supports ${CATEGORY_LABELS[incident.category]} response. ${
          hasIncidentCoordinates
            ? "The resource base has no coordinates, so no distance is shown."
            : "Proximity ranking is unavailable because the incident has no coordinates."
        }`,
      };
    }
  );

  if (hasIncidentCoordinates) {
    recommendations.sort((left, right) => {
      const leftDistance = left.distanceKm ?? Number.POSITIVE_INFINITY;
      const rightDistance = right.distanceKm ?? Number.POSITIVE_INFINITY;

      return (
        leftDistance - rightDistance ||
        left.resourceCode.localeCompare(right.resourceCode)
      );
    });
  }

  let message: string | undefined;

  if (recommendations.length === 0) {
    message =
      "No available demo resource supports this incident category. Update resource availability or add an eligible demo unit.";
  } else if (!hasIncidentCoordinates) {
    message =
      "Incident coordinates are missing, so eligible resources are listed without a distance ranking.";
  }

  return {
    incident,
    recommendations,
    proximityAvailable: hasIncidentCoordinates,
    message,
  };
}
