import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const counterSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  seq: { type: Number, required: true, default: 0 },
});

export type CounterDocument = InferSchemaType<typeof counterSchema>;

export const Counter: Model<CounterDocument> =
  (models.Counter as Model<CounterDocument>) ??
  model<CounterDocument>("Counter", counterSchema);
