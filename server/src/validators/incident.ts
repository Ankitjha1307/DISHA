import { z } from "zod";

import {
  INCIDENT_CATEGORIES,
  INCIDENT_STATUSES,
} from "../models/common";

function optionalCoordinate(minimum: number, maximum: number) {
  return z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : value,
    z.coerce.number().min(minimum).max(maximum).optional()
  );
}

export const createIncidentSchema = z
  .object({
    category: z.enum(INCIDENT_CATEGORIES),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description must be at most 2000 characters"),
    locationLabel: z
      .string()
      .trim()
      .min(3, "Describe the incident location")
      .max(240, "Location must be at most 240 characters"),
    latitude: optionalCoordinate(-90, 90),
    longitude: optionalCoordinate(-180, 180),
  })
  .refine(
    (value) =>
      (value.latitude === undefined) === (value.longitude === undefined),
    {
      message: "Provide both latitude and longitude, or neither",
      path: ["latitude"],
    }
  );

export const listIncidentsQuerySchema = z.object({
  category: z.enum(INCIDENT_CATEGORIES).optional(),
  status: z.enum(INCIDENT_STATUSES).optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type ListIncidentsQuery = z.infer<typeof listIncidentsQuerySchema>;
