import { Types, type HydratedDocument } from "mongoose";

import type {
  IncidentCategory,
  ResourceAvailability,
  ResourceType,
} from "../models/common";
import { Deployment } from "../models/Deployment";
import { Resource, type ResourceDocument } from "../models/Resource";
import { ApiError } from "../utils/ApiError";

export type ResourceLocation = {
  label: string;
  latitude?: number;
  longitude?: number;
};

export type ResourceJson = {
  id: string;
  resourceCode: string;
  name: string;
  type: ResourceType;
  capabilities: IncidentCategory[];
  location: ResourceLocation;
  availability: ResourceAvailability;
  createdAt: Date;
  updatedAt: Date;
};

function assertValidResourceId(resourceId: string) {
  if (!Types.ObjectId.isValid(resourceId)) {
    throw new ApiError(404, "Resource not found");
  }
}

export function resourceToJson(
  resource: HydratedDocument<ResourceDocument>
): ResourceJson {
  return {
    id: String(resource._id),
    resourceCode: resource.resourceCode,
    name: resource.name,
    type: resource.type as ResourceType,
    capabilities: resource.capabilities as IncidentCategory[],
    location: {
      label: resource.location.label,
      latitude: resource.location.latitude ?? undefined,
      longitude: resource.location.longitude ?? undefined,
    },
    availability: resource.availability as ResourceAvailability,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}

export async function listResources() {
  return Resource.find().sort({ type: 1, resourceCode: 1 });
}

export async function updateResourceAvailability(
  resourceId: string,
  availability: "available" | "unavailable"
) {
  assertValidResourceId(resourceId);

  const activeDeployment = await Deployment.exists({
    resourceId,
    status: "assigned",
  });

  if (activeDeployment) {
    throw new ApiError(
      409,
      "This resource has an active deployment. Complete or cancel the deployment before changing availability."
    );
  }

  const resource = await Resource.findByIdAndUpdate(
    resourceId,
    { $set: { availability } },
    { returnDocument: "after", runValidators: true }
  );

  if (!resource) {
    throw new ApiError(404, "Resource not found");
  }

  return resource;
}
