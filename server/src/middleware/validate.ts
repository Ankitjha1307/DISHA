import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { ApiError } from "../utils/ApiError";

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new ApiError(
          400,
          "Validation failed",
          result.error.flatten().fieldErrors
        )
      );
      return;
    }

    req.body = result.data;
    next();
  };
}
