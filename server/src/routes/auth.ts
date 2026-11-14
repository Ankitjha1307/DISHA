import { Router } from "express";

import { authenticate } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimits";
import { validateBody } from "../middleware/validate";
import {
  authenticateUser,
  registerCitizen,
} from "../services/authService";
import { asyncHandler } from "../utils/asyncHandler";
import {
  clearAuthCookie,
  setAuthCookie,
  signAuthToken,
} from "../utils/authToken";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "../validators/auth";

export const authRouter = Router();

authRouter.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const user = await registerCitizen(req.body as RegisterInput);
    setAuthCookie(res, signAuthToken(user.id, user.role));

    res.set("Cache-Control", "no-store");
    res.status(201).json({ user });
  })
);

authRouter.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await authenticateUser(req.body as LoginInput);
    setAuthCookie(res, signAuthToken(user.id, user.role));

    res.set("Cache-Control", "no-store");
    res.json({ user });
  })
);

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
});

authRouter.get(
  "/me",
  authenticate,
  (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ user: req.auth });
  }
);
