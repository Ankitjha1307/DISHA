import { z } from "zod";

export const resourceAvailabilityBodySchema = z.object({
  availability: z.enum(["available", "unavailable"]),
});

export const createDeploymentBodySchema = z.object({
  resourceId: z.string().trim().min(1, "A resource is required"),
  notes: z
    .string()
    .trim()
    .min(1, "Deployment notes cannot be empty")
    .max(500, "Deployment notes must be at most 500 characters")
    .optional(),
});

export const updateDeploymentBodySchema = z.object({
  status: z.enum(["completed", "cancelled"]),
  notes: z
    .string()
    .trim()
    .min(1, "Deployment notes cannot be empty")
    .max(500, "Deployment notes must be at most 500 characters")
    .optional(),
});

export type ResourceAvailabilityBody = z.infer<
  typeof resourceAvailabilityBodySchema
>;
export type CreateDeploymentBody = z.infer<typeof createDeploymentBodySchema>;
export type UpdateDeploymentBody = z.infer<typeof updateDeploymentBodySchema>;
