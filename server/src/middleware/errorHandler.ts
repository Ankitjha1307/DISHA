import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";

import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    res.status(400).json({
      error: {
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Image must be 5 MB or smaller"
            : "Invalid image upload",
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        details: error.flatten(),
      },
    });
    return;
  }

  // Avoid leaking internals in production.
  console.error("Unhandled server error:", error);

  res.status(500).json({
    error: {
      message: "An internal server error occurred.",
    },
  });
}
