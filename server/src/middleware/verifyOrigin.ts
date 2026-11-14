import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Basic CSRF hardening for cookie-authenticated state-changing requests:
 * reject browser requests whose Origin does not exactly match the configured
 * frontend origin. Requests without an Origin header (for example curl) are
 * allowed because the session cookie is still required for protected routes.
 */
export function verifyOrigin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin;

  if (origin && origin !== env.CLIENT_ORIGIN) {
    next(new ApiError(403, "Request origin is not allowed"));
    return;
  }

  next();
}
