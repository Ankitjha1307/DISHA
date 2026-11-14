import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth";
import { incidentSubmissionLimiter } from "../middleware/rateLimits";
import {
  persistIncidentImage,
  removeUploadedImage,
  uploadIncidentImage,
  type StoredImage,
} from "../middleware/upload";
import { validateBody } from "../middleware/validate";
import {
  createIncident,
  getCitizenIncident,
  listCitizenIncidents,
} from "../services/incidentService";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { parseQuery } from "../utils/parseQuery";
import {
  createIncidentSchema,
  listIncidentsQuerySchema,
  type CreateIncidentInput,
  type ListIncidentsQuery,
} from "../validators/incident";

export const incidentRouter = Router();

incidentRouter.use(authenticate);

incidentRouter.post(
  "/",
  authorize("citizen"),
  incidentSubmissionLimiter,
  uploadIncidentImage,
  validateBody(createIncidentSchema),
  asyncHandler(async (req, res) => {
    const reporterId = req.auth!.id;
    let storedImage: StoredImage | undefined;

    try {
      storedImage = await persistIncidentImage(req.file);
      const incident = await createIncident(
        reporterId,
        req.body as CreateIncidentInput,
        storedImage?.url
      );

      res.status(201).json({ incident });
    } catch (error) {
      await removeUploadedImage(storedImage);
      throw error;
    }
  })
);

incidentRouter.get(
  "/my",
  authorize("citizen"),
  asyncHandler(async (req, res) => {
    const filters = parseQuery<ListIncidentsQuery>(
      listIncidentsQuerySchema,
      req.query
    );
    const incidents = await listCitizenIncidents(req.auth!.id, filters);

    res.json({ incidents });
  })
);

incidentRouter.get(
  "/my/:id",
  authorize("citizen"),
  asyncHandler(async (req, res) => {
    const incidentId = req.params.id;

    if (typeof incidentId !== "string") {
      throw new ApiError(404, "Report not found");
    }

    const incident = await getCitizenIncident(req.auth!.id, incidentId);

    if (!incident) {
      throw new ApiError(404, "Report not found");
    }

    res.json({ incident });
  })
);
