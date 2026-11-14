import { Router, type Request } from "express";

import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { ACTIVE_INCIDENT_STATUSES } from "../models/common";
import { Incident } from "../models/Incident";
import { Resource } from "../models/Resource";
import {
  createDeployment,
  getActiveIncidentDeployment,
  listDeployments,
  updateDeployment,
} from "../services/deploymentService";
import {
  getOfficerIncident,
  listOfficerIncidents,
  setIncidentSeverity,
  transitionIncident,
} from "../services/officerIncidentService";
import { getResourceRecommendations } from "../services/recommendationService";
import {
  listResources,
  updateResourceAvailability,
} from "../services/resourceService";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { parseQuery } from "../utils/parseQuery";
import {
  createDeploymentBodySchema,
  resourceAvailabilityBodySchema,
  updateDeploymentBodySchema,
  type CreateDeploymentBody,
  type ResourceAvailabilityBody,
  type UpdateDeploymentBody,
} from "../validators/deployment";
import {
  officerIncidentQuerySchema,
  officerNotesBodySchema,
  officerSeverityBodySchema,
  type OfficerIncidentQuery,
  type OfficerNotesBody,
  type OfficerSeverityBody,
} from "../validators/officerIncident";

export const officerRouter = Router();

officerRouter.use(authenticate, authorize("officer"));

function idFrom(req: Request, key: string, label: string) {
  const value = req.params[key];

  if (typeof value !== "string") {
    throw new ApiError(404, `${label} not found`);
  }

  return value;
}

function incidentIdFrom(req: Request) {
  return idFrom(req, "id", "Report");
}

function requireAuthUserId(req: Request) {
  if (!req.auth) {
    throw new ApiError(401, "Authentication required");
  }

  return req.auth.id;
}

officerRouter.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const [
      activeIncidents,
      awaitingVerification,
      highPriority,
      availableResources,
      recentIncidents,
    ] = await Promise.all([
      Incident.countDocuments({ status: { $in: ACTIVE_INCIDENT_STATUSES } }),
      Incident.countDocuments({
        status: { $in: ["submitted", "under_review"] },
      }),
      Incident.countDocuments({
        status: { $in: ACTIVE_INCIDENT_STATUSES },
        severity: { $in: ["high", "critical"] },
      }),
      Resource.countDocuments({ availability: "available" }),
      Incident.find({ status: { $in: ACTIVE_INCIDENT_STATUSES } })
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    res.json({
      kpis: {
        activeIncidents,
        awaitingVerification,
        highPriority,
        availableResources,
      },
      recentIncidents,
    });
  })
);

officerRouter.get(
  "/incidents",
  asyncHandler(async (req, res) => {
    const filters = parseQuery<OfficerIncidentQuery>(
      officerIncidentQuerySchema,
      req.query
    );
    const incidents = await listOfficerIncidents(filters);

    res.json({ incidents });
  })
);

officerRouter.get(
  "/incidents/:id/recommendations",
  asyncHandler(async (req, res) => {
    const result = await getResourceRecommendations(incidentIdFrom(req));

    res.json(result);
  })
);

officerRouter.post(
  "/incidents/:id/deployments",
  validateBody(createDeploymentBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as CreateDeploymentBody;
    const incidentId = incidentIdFrom(req);
    const result = await createDeployment({
      incidentId,
      resourceId: body.resourceId,
      assignedBy: requireAuthUserId(req),
      notes: body.notes,
    });
    const activeDeployment = await getActiveIncidentDeployment(incidentId);

    res.status(201).json({
      deployment: result.deployment,
      incident: result.incident,
      activeDeployment,
    });
  })
);

officerRouter.get(
  "/incidents/:id",
  asyncHandler(async (req, res) => {
    const incidentId = incidentIdFrom(req);
    const [incident, activeDeployment] = await Promise.all([
      getOfficerIncident(incidentId),
      getActiveIncidentDeployment(incidentId),
    ]);

    res.json({ incident, activeDeployment });
  })
);

officerRouter.patch(
  "/incidents/:id/review",
  validateBody(officerNotesBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as OfficerNotesBody;
    const incident = await transitionIncident(
      incidentIdFrom(req),
      "review",
      body.notes
    );

    res.json({ incident });
  })
);

officerRouter.patch(
  "/incidents/:id/verify",
  validateBody(officerNotesBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as OfficerNotesBody;
    const incident = await transitionIncident(
      incidentIdFrom(req),
      "verify",
      body.notes
    );

    res.json({ incident });
  })
);

officerRouter.patch(
  "/incidents/:id/reject",
  validateBody(officerNotesBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as OfficerNotesBody;
    const incident = await transitionIncident(
      incidentIdFrom(req),
      "reject",
      body.notes
    );

    res.json({ incident });
  })
);

officerRouter.patch(
  "/incidents/:id/severity",
  validateBody(officerSeverityBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as OfficerSeverityBody;
    const incident = await setIncidentSeverity(
      incidentIdFrom(req),
      body.severity
    );

    res.json({ incident });
  })
);

officerRouter.get(
  "/resources",
  asyncHandler(async (_req, res) => {
    const resources = await listResources();

    res.json({ resources });
  })
);

officerRouter.patch(
  "/resources/:id/availability",
  validateBody(resourceAvailabilityBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as ResourceAvailabilityBody;
    const resource = await updateResourceAvailability(
      idFrom(req, "id", "Resource"),
      body.availability
    );

    res.json({ resource });
  })
);

officerRouter.get(
  "/deployments",
  asyncHandler(async (_req, res) => {
    const deployments = await listDeployments();

    res.json({ deployments });
  })
);

officerRouter.patch(
  "/deployments/:id",
  validateBody(updateDeploymentBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as UpdateDeploymentBody;
    const result = await updateDeployment(
      idFrom(req, "id", "Deployment"),
      body.status,
      body.notes
    );

    res.json({
      deployment: result.deployment,
      incident: result.incident,
      activeDeployment: null,
    });
  })
);
