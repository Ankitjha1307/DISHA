import { Types, type HydratedDocument } from "mongoose";

import type {
  DeploymentStatus,
  IncidentCategory,
  IncidentStatus,
  ResourceAvailability,
  ResourceType,
} from "../models/common";
import { Deployment, type DeploymentDocument } from "../models/Deployment";
import { Incident, type IncidentDocument } from "../models/Incident";
import { Resource, type ResourceDocument } from "../models/Resource";
import { ApiError } from "../utils/ApiError";
import { resourceToJson } from "./resourceService";

type DeploymentDoc = HydratedDocument<DeploymentDocument>;
type IncidentDoc = HydratedDocument<IncidentDocument>;
type ResourceDoc = HydratedDocument<ResourceDocument>;

type IncidentSummary = {
  id: string;
  reportId: string;
  category: IncidentCategory;
  status: IncidentStatus;
  location: {
    label: string;
    latitude?: number;
    longitude?: number;
  };
};

type ResourceSummary = {
  id: string;
  resourceCode: string;
  name: string;
  type: ResourceType;
  availability: ResourceAvailability;
  location: {
    label: string;
    latitude?: number;
    longitude?: number;
  };
};

type DeploymentBase = {
  id: string;
  status: DeploymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ActiveDeploymentJson = DeploymentBase & {
  resource: ResourceSummary | null;
};

export type DeploymentJson = ActiveDeploymentJson & {
  incident: IncidentSummary | null;
};

function assertValidId(value: string, label: string) {
  if (!Types.ObjectId.isValid(value)) {
    throw new ApiError(404, `${label} not found`);
  }
}

function deploymentBase(deployment: DeploymentDoc): DeploymentBase {
  const json = deployment.toJSON() as unknown as {
    id: string;
    status: DeploymentStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    id: json.id,
    status: json.status,
    notes: json.notes,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

function incidentSummary(incident: IncidentDoc): IncidentSummary {
  const json = incident.toJSON() as unknown as {
    id: string;
    reportId: string;
    category: IncidentCategory;
    status: IncidentStatus;
    location: {
      label: string;
      latitude?: number;
      longitude?: number;
    };
  };

  return {
    id: json.id,
    reportId: json.reportId,
    category: json.category,
    status: json.status,
    location: {
      label: json.location.label,
      latitude: json.location.latitude,
      longitude: json.location.longitude,
    },
  };
}

function resourceSummary(resource: ResourceDoc): ResourceSummary {
  const serialized = resourceToJson(resource);

  return {
    id: serialized.id,
    resourceCode: serialized.resourceCode,
    name: serialized.name,
    type: serialized.type,
    availability: serialized.availability,
    location: serialized.location,
  };
}

function activeDeploymentJson(
  deployment: DeploymentDoc,
  resource: ResourceDoc | null
): ActiveDeploymentJson {
  return {
    ...deploymentBase(deployment),
    resource: resource ? resourceSummary(resource) : null,
  };
}

function deploymentJson(
  deployment: DeploymentDoc,
  incident: IncidentDoc | null,
  resource: ResourceDoc | null
): DeploymentJson {
  return {
    ...activeDeploymentJson(deployment, resource),
    incident: incident ? incidentSummary(incident) : null,
  };
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function listDeployments() {
  const deployments = await Deployment.find()
    .sort({ createdAt: -1 })
    .limit(200);

  const incidentIds = [...new Set(deployments.map((item) => String(item.incidentId)))];
  const resourceIds = [...new Set(deployments.map((item) => String(item.resourceId)))];

  const [incidents, resources] = await Promise.all([
    Incident.find({ _id: { $in: incidentIds } }),
    Resource.find({ _id: { $in: resourceIds } }),
  ]);

  const incidentById = new Map(
    incidents.map((incident) => [String(incident._id), incident])
  );
  const resourceById = new Map(
    resources.map((resource) => [String(resource._id), resource])
  );

  return deployments.map((deployment) =>
    deploymentJson(
      deployment,
      incidentById.get(String(deployment.incidentId)) ?? null,
      resourceById.get(String(deployment.resourceId)) ?? null
    )
  );
}

export async function getActiveIncidentDeployment(
  incidentId: string
): Promise<ActiveDeploymentJson | null> {
  if (!Types.ObjectId.isValid(incidentId)) {
    return null;
  }

  const deployment = await Deployment.findOne({
    incidentId,
    status: "assigned",
  }).sort({ createdAt: -1 });

  if (!deployment) {
    return null;
  }

  const resource = await Resource.findById(deployment.resourceId);

  return activeDeploymentJson(deployment, resource);
}

export async function createDeployment(input: {
  incidentId: string;
  resourceId: string;
  assignedBy: string;
  notes?: string;
}) {
  assertValidId(input.incidentId, "Report");
  assertValidId(input.resourceId, "Resource");

  const incident = await Incident.findById(input.incidentId);

  if (!incident) {
    throw new ApiError(404, "Report not found");
  }

  if (incident.status !== "verified") {
    throw new ApiError(
      409,
      "Only a verified report can be assigned a demo resource"
    );
  }

  const resource = await Resource.findById(input.resourceId);

  if (!resource) {
    throw new ApiError(404, "Resource not found");
  }

  if (resource.availability !== "available") {
    throw new ApiError(409, "This resource is not currently available");
  }

  if (!resource.capabilities.includes(incident.category)) {
    throw new ApiError(
      409,
      "This resource does not support the incident category"
    );
  }

  const reservedResource = await Resource.findOneAndUpdate(
    { _id: input.resourceId, availability: "available" },
    { $set: { availability: "deployed" } },
    { returnDocument: "after", runValidators: true }
  );

  if (!reservedResource) {
    throw new ApiError(409, "This resource is not currently available");
  }

  let deployment;

  try {
    deployment = await Deployment.create({
      incidentId: input.incidentId,
      resourceId: input.resourceId,
      assignedBy: input.assignedBy,
      status: "assigned",
      notes: input.notes,
    });
  } catch (error) {
    await Resource.findByIdAndUpdate(input.resourceId, {
      $set: { availability: "available" },
    });

    if (isDuplicateKeyError(error)) {
      throw new ApiError(
        409,
        "This resource is already assigned to an active deployment"
      );
    }

    throw error;
  }

  const updatedIncident = await Incident.findOneAndUpdate(
    { _id: input.incidentId, status: "verified" },
    { $set: { status: "dispatched" } },
    { returnDocument: "after", runValidators: true }
  );

  if (!updatedIncident) {
    await Deployment.findByIdAndUpdate(deployment._id, {
      $set: { status: "cancelled" },
    });
    await Resource.findByIdAndUpdate(input.resourceId, {
      $set: { availability: "available" },
    });

    throw new ApiError(
      409,
      "The report changed while the deployment was being created. Reload and try again."
    );
  }

  return {
    deployment: deploymentJson(
      deployment,
      updatedIncident,
      reservedResource
    ),
    incident: updatedIncident,
    resource: reservedResource,
  };
}

export async function updateDeployment(
  deploymentId: string,
  status: "completed" | "cancelled",
  notes?: string
) {
  assertValidId(deploymentId, "Deployment");

  const existing = await Deployment.findById(deploymentId);

  if (!existing) {
    throw new ApiError(404, "Deployment not found");
  }

  if (existing.status !== "assigned") {
    throw new ApiError(
      409,
      "Only an active deployment can be completed or cancelled"
    );
  }

  const [incident, resource] = await Promise.all([
    Incident.findById(existing.incidentId),
    Resource.findById(existing.resourceId),
  ]);

  if (!incident) {
    throw new ApiError(404, "Report not found");
  }

  if (!resource) {
    throw new ApiError(404, "Resource not found");
  }

  if (incident.status !== "dispatched") {
    throw new ApiError(
      409,
      "The report must be dispatched before its deployment can be updated"
    );
  }

  const deployment = await Deployment.findOneAndUpdate(
    { _id: deploymentId, status: "assigned" },
    {
      $set: {
        status,
        ...(notes ? { notes } : {}),
      },
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!deployment) {
    throw new ApiError(
      409,
      "The deployment changed while this request was being processed. Reload and try again."
    );
  }

  const nextIncidentStatus = status === "completed" ? "resolved" : "verified";

  try {
    const [updatedIncident, updatedResource] = await Promise.all([
      Incident.findOneAndUpdate(
        { _id: incident._id, status: "dispatched" },
        { $set: { status: nextIncidentStatus } },
        { returnDocument: "after", runValidators: true }
      ),
      Resource.findByIdAndUpdate(
        resource._id,
        { $set: { availability: "available" } },
        { returnDocument: "after", runValidators: true }
      ),
    ]);

    if (!updatedIncident || !updatedResource) {
      throw new ApiError(
        409,
        "The report or resource changed while the deployment was being updated. Reload and try again."
      );
    }

    return {
      deployment: deploymentJson(deployment, updatedIncident, updatedResource),
      incident: updatedIncident,
      resource: updatedResource,
    };
  } catch (error) {
    await Deployment.findByIdAndUpdate(deploymentId, {
      $set: { status: "assigned" },
    });
    await Incident.findByIdAndUpdate(incident._id, {
      $set: { status: "dispatched" },
    });
    await Resource.findByIdAndUpdate(resource._id, {
      $set: { availability: "deployed" },
    });

    throw error;
  }
}
