import type { CookieOptions, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env, isProduction } from "../config/env";
import { ROLES, type Role } from "../models/common";

export const AUTH_COOKIE = "disha_token";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthTokenPayload = {
  sub: string;
  role: Role;
};

export function signAuthToken(userId: string, role: Role) {
  return jwt.sign({ role }, env.JWT_SECRET, {
    subject: userId,
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (typeof decoded === "string") {
    throw new Error("Invalid session token");
  }

  const payload = decoded as JwtPayload;
  const role = payload.role;

  if (
    !payload.sub ||
    typeof role !== "string" ||
    !ROLES.includes(role as Role)
  ) {
    throw new Error("Invalid session token");
  }

  return { sub: payload.sub, role: role as Role };
}

function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    // Cross-site deployment (Vercel frontend + Render API) needs SameSite=None.
    // Local development stays on Lax. Origin checks are applied globally.
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: TOKEN_TTL_MS,
  };
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
}

export function clearAuthCookie(res: Response) {
  const { maxAge: _maxAge, ...options } = authCookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
}
