import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

import { applyJsonTransform } from "./common";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["citizen", "officer"],
      required: true,
      default: "citizen",
    },
  },
  { timestamps: true }
);

applyJsonTransform(userSchema);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) ??
  model<UserDocument>("User", userSchema);
