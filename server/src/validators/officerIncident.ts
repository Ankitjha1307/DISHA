import { z } from "zod";

import {
  INCIDENT_CATEGORIES,
  INCIDENT_STATUSES,
  SEVERITIES,
} from "../models/common";

export const officerNotesBodySchema = z
  .object({
    notes: z
      .string()
      .trim()
      .min(1, "Officer notes cannot be empty")
      .max(2000, "Officer notes must be at most 2000 characters")
      .optional(),
  })
  .default({});

export const officerSeverityBodySchema = z.object({
  severity: z.enum(SEVERITIES),
});

export const officerIncidentQuerySchema = z.object({
  status: z.enum(INCIDENT_STATUSES).optional(),
  category: z.enum(INCIDENT_CATEGORIES).optional(),
  severity: z.enum(SEVERITIES).optional(),
  q: z.string().trim().max(120).optional(),
});

export type OfficerNotesBody = z.infer<typeof officerNotesBodySchema>;
export type OfficerSeverityBody = z.infer<typeof officerSeverityBodySchema>;
export type OfficerIncidentQuery = z.infer<typeof officerIncidentQuerySchema>;
