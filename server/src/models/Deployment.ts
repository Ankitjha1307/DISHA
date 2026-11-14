import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

import { applyJsonTransform, DEPLOYMENT_STATUSES } from "./common";

const deploymentSchema = new Schema(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: DEPLOYMENT_STATUSES,
      required: true,
      default: "assigned",
      index: true,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: undefined,
    },
  },
  { timestamps: true }
);

// A resource can only have one active (assigned) deployment at a time.
deploymentSchema.index(
  { resourceId: 1 },
  { unique: true, partialFilterExpression: { status: "assigned" } }
);

applyJsonTransform(deploymentSchema);

export type DeploymentDocument = InferSchemaType<typeof deploymentSchema>;

export const Deployment: Model<DeploymentDocument> =
  (models.Deployment as Model<DeploymentDocument>) ??
  model<DeploymentDocument>("Deployment", deploymentSchema);
