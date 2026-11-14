import type { ZodType } from "zod";

import { ApiError } from "./ApiError";

export function parseQuery<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(
      400,
      "Validation failed",
      result.error.flatten().fieldErrors
    );
  }

  return result.data;
}
