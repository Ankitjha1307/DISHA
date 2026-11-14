import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

import {
  applyJsonTransform,
  INCIDENT_CATEGORIES,
  locationSchema,
  RESOURCE_AVAILABILITIES,
  RESOURCE_TYPES,
} from "./common";

const resourceSchema = new Schema(
  {
    resourceCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    type: {
      type: String,
      enum: RESOURCE_TYPES,
      required: true,
    },
    capabilities: {
      type: [String],
      enum: INCIDENT_CATEGORIES,
      required: true,
      default: [],
    },
    location: {
      type: locationSchema,
      required: true,
    },
    availability: {
      type: String,
      enum: RESOURCE_AVAILABILITIES,
      required: true,
      default: "available",
      index: true,
    },
  },
  { timestamps: true }
);

applyJsonTransform(resourceSchema);

export type ResourceDocument = InferSchemaType<typeof resourceSchema>;

export const Resource: Model<ResourceDocument> =
  (models.Resource as Model<ResourceDocument>) ??
  model<ResourceDocument>("Resource", resourceSchema);
