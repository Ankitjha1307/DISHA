import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const booleanFromString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const optionalEnvString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().min(1).optional()
);

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z
      .string()
      .refine(
        (value) =>
          value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
        "MONGODB_URI must start with mongodb:// or mongodb+srv://"
      )
      .optional(),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET must be at least 32 characters long"),
    CLIENT_ORIGIN: z.string().url(),
    OFFICER_SEED_EMAIL: z.string().email(),
    OFFICER_SEED_PASSWORD: z.string().min(8),
    USE_MEMORY_DB: booleanFromString,
    SEED_ON_START: booleanFromString,
    UPLOAD_DIR: optionalEnvString,
    CLOUDINARY_CLOUD_NAME: optionalEnvString,
    CLOUDINARY_API_KEY: optionalEnvString,
    CLOUDINARY_API_SECRET: optionalEnvString,
  })
  .superRefine((value, ctx) => {
    if (!value.USE_MEMORY_DB && !value.MONGODB_URI) {
      ctx.addIssue({
        code: "custom",
        path: ["MONGODB_URI"],
        message: "MONGODB_URI is required unless USE_MEMORY_DB=true",
      });
    }

    if (value.NODE_ENV === "production" && value.USE_MEMORY_DB) {
      ctx.addIssue({
        code: "custom",
        path: ["USE_MEMORY_DB"],
        message: "USE_MEMORY_DB cannot be enabled in production",
      });
    }

    const cloudinaryValues = [
      value.CLOUDINARY_CLOUD_NAME,
      value.CLOUDINARY_API_KEY,
      value.CLOUDINARY_API_SECRET,
    ];
    const configuredCloudinaryValues = cloudinaryValues.filter(Boolean).length;

    if (
      configuredCloudinaryValues > 0 &&
      configuredCloudinaryValues < cloudinaryValues.length
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["CLOUDINARY_CLOUD_NAME"],
        message:
          "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET together, or leave all three blank for local storage",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  console.error(`Invalid server environment:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
