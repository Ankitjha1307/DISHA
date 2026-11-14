import type { RequestHandler } from "express";

import type { Role } from "../models/common";
import { findPublicUserById } from "../services/authService";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { AUTH_COOKIE, verifyAuthToken } from "../utils/authToken";

export const authenticate: RequestHandler = asyncHandler(
  async (req, _res, next) => {
    const token = req.cookies?.[AUTH_COOKIE];

    if (typeof token !== "string" || token.length === 0) {
      throw new ApiError(401, "Authentication required");
    }

    let payload;

    try {
      payload = verifyAuthToken(token);
    } catch {
      throw new ApiError(401, "Session is invalid or expired");
    }

    const user = await findPublicUserById(payload.sub);

    if (!user) {
      throw new ApiError(401, "Session user no longer exists");
    }

    req.auth = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  }
);

export function authorize(...allowedRoles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      next(
        new ApiError(403, "You do not have permission to perform this action")
      );
      return;
    }

    next();
  };
}
