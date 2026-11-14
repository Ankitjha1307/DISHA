import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

import {
  applyJsonTransform,
  INCIDENT_CATEGORIES,
  INCIDENT_STATUSES,
  locationSchema,
  SEVERITIES,
} from "./common";

const incidentSchema = new Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: INCIDENT_CATEGORIES,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    imageUrl: {
      type: String,
      default: undefined,
    },
    severity: {
      type: String,
      enum: SEVERITIES,
      default: undefined,
    },
    status: {
      type: String,
      enum: INCIDENT_STATUSES,
      default: "submitted",
      required: true,
      index: true,
    },
    officerNotes: {
      type: String,
      maxlength: 2000,
      select: false,
      default: undefined,
    },
  },
  { timestamps: true }
);

incidentSchema.index({ status: 1, createdAt: -1 });

applyJsonTransform(incidentSchema);

export type IncidentDocument = InferSchemaType<typeof incidentSchema>;

export const Incident: Model<IncidentDocument> =
  (models.Incident as Model<IncidentDocument>) ??
  model<IncidentDocument>("Incident", incidentSchema);
