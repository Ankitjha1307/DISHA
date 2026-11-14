import { Schema } from "mongoose";

export const INCIDENT_CATEGORIES = [
  "fire",
  "road_accident",
  "flooding",
  "building_damage",
  "medical_emergency",
  "other",
] as const;

export const INCIDENT_STATUSES = [
  "submitted",
  "under_review",
  "verified",
  "dispatched",
  "resolved",
  "rejected",
] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const ROLES = ["citizen", "officer"] as const;

export const RESOURCE_TYPES = [
  "ambulance",
  "fire_unit",
  "rescue_team",
  "shelter",
] as const;

export const RESOURCE_AVAILABILITIES = [
  "available",
  "deployed",
  "unavailable",
] as const;

export const DEPLOYMENT_STATUSES = [
  "assigned",
  "completed",
  "cancelled",
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type Role = (typeof ROLES)[number];
export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type ResourceAvailability = (typeof RESOURCE_AVAILABILITIES)[number];
export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

export const ACTIVE_INCIDENT_STATUSES: IncidentStatus[] = [
  "submitted",
  "under_review",
  "verified",
  "dispatched",
];

export const locationSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 240 },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
  },
  { _id: false }
);

export function applyJsonTransform(schema: Schema) {
  schema.set("toJSON", {
    versionKey: false,
    transform: (_document, returned) => {
      const value = returned as unknown as Record<string, unknown>;
      value.id = String(value._id);
      delete value._id;
      delete value.passwordHash;
      return value;
    },
  });
}
